import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { transaction_status } from '@prisma/client';
import { TransactionService } from '../../services/transaction.service'; // Impor TransactionService

export function startExpireCronJob() {
  // Cron job untuk kupon dan poin (setiap hari jam 00:00)
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    console.log('Menjalankan cron job untuk cek Coupon dan Point expired');
    try {
        const expiredCoupons = await prisma.coupons.updateMany({
            where: {
            expired_at: { lt: now },
            is_used: false,
            },
            // Seharusnya ada field status di Coupons, atau logika lain jika is_used untuk menandai expired
            // Untuk sementara, kita bisa update field 'is_used' menjadi true atau menambahkan field 'status'
            data: { is_used: true }, // Atau data: { status: 'EXPIRED' } jika ada field status
        });

        const expiredPoints = await prisma.user_Points.updateMany({
            where: {
            expired_at: { lt: now },
            amount: { gt: 0 },
            },
            data: { amount: 0 }, // Atau data: { status: 'EXPIRED' } jika ada field status
        });

        console.log(`Cron: Expired coupons marked: ${expiredCoupons.count}`);
        console.log(`Cron: Expired points set to 0: ${expiredPoints.count}`);
        } catch (err) {
        console.error('Cron: Gagal menjalankan cron job expired (Coupons/Points):', err);
        }
    });

    // Cron job untuk transaksi (setiap 5 menit)
    // Anda bisa menyesuaikan frekuensinya
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date();
        console.log('Menjalankan cron job untuk cek Transaksi expired/auto-cancel');

        try {
        // 1. Transaksi yang WAITING_PAYMENT atau PENDING dan sudah melewati payment_due_date
        const expiredPaymentTransactions = await prisma.transactions.findMany({
            where: {
            OR: [
                { status: transaction_status.WAITING_PAYMENT },
                { status: transaction_status.PENDING }
            ],
            payment_due_date: { lt: now },
            },
        });

        for (const trx of expiredPaymentTransactions) {
            console.log(`Cron: Memproses transaksi ID ${trx.id} yang kadaluwarsa pembayarannya.`);
            await prisma.$transaction(async (tx) => {
                await tx.transactions.update({
                    where: { id: trx.id },
                    data: { 
                        status: transaction_status.EXPIRED,
                        cancellation_reason: "Pembayaran kadaluwarsa (batas waktu terlewati).",
                        updated_at: new Date()
                    },
                });
                await TransactionService.rollbackTransactionResources(trx.id, "Pembayaran kadaluwarsa (batas waktu terlewati).", tx);
            });
            console.log(`Cron: Transaksi ID ${trx.id} diubah menjadi EXPIRED dan sumber daya dikembalikan.`);
        }

        // 2. Transaksi yang WAITING_CONFIRMATION dan sudah melewati organizer_confirmation_due_date
        const unconfirmedTransactions = await prisma.transactions.findMany({
            where: {
            status: transaction_status.WAITING_CONFIRMATION,
            organizer_confirmation_due_date: { lt: now },
            },
        });

        for (const trx of unconfirmedTransactions) {
            console.log(`Cron: Memproses transaksi ID ${trx.id} yang tidak dikonfirmasi organizer.`);
            await prisma.$transaction(async (tx) => {
                await tx.transactions.update({
                    where: { id: trx.id },
                    data: { 
                        status: transaction_status.CANCELED,
                        cancellation_reason: "Dibatalkan otomatis oleh sistem (tidak ada konfirmasi dari organizer).",
                        updated_at: new Date()
                    },
                });
                await TransactionService.rollbackTransactionResources(trx.id, "Dibatalkan otomatis oleh sistem (tidak ada konfirmasi dari organizer).", tx);
            });
            console.log(`Cron: Transaksi ID ${trx.id} diubah menjadi CANCELED dan sumber daya dikembalikan.`);
        }

        if (expiredPaymentTransactions.length > 0 || unconfirmedTransactions.length > 0) {
            console.log(`Cron: Transaksi kadaluwarsa pembayaran diproses: ${expiredPaymentTransactions.length}`);
            console.log(`Cron: Transaksi tidak dikonfirmasi organizer diproses: ${unconfirmedTransactions.length}`);
        } else {
            // console.log('Cron: Tidak ada transaksi yang perlu diupdate statusnya (expired/auto-cancel).');
        }

        } catch (err) {
        console.error('Cron: Gagal menjalankan cron job transaksi:', err);
        }
    });

    console.log("Cron jobs untuk expiration (Coupons, Points, Transactions) telah dimulai.");
}