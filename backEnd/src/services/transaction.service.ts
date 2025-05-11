import prisma from "../lib/prisma";
import {
    ICreateTransactionInput,
    ITransactionOutput,
    IMidtransNotificationPayload,
    // MidtransTransactionStatus, // Tidak terpakai langsung di sini
    ITransactionWithDetails
} from "../interface/transaction.interface";
import { IJwt } from "../interface/auth";
import { snap, coreApi } from "../lib/midtrans"; // Impor Midtrans Snap client
import * as midtransClient from 'midtrans-client'; // Import midtrans-client for type definitions
import { User, Event, Ticket_Type, Coupons, Vouchers, transaction_status, Prisma, $Enums } from "@prisma/client"; // Import $Enums untuk type safety enum
import { APP_URL, FRONTEND_URL, MIDTRANS_SERVER_KEY, PAYMENT_DUE_HOURS, ORGANIZER_CONFIRMATION_DUE_DAYS } from "../config";
import crypto from 'crypto';

// Perbaikan untuk interface jika belum dilakukan (opsional, tergantung file interface Anda)
// Pastikan created_at di ITransactionOutput dan ITransactionWithDetails adalah Date | null
// Jika sudah, tidak perlu diubah di sini.
// interface ITransactionOutput { /* ... */ created_at: Date | null; /* ... */ }
// interface ITransactionWithDetails extends ITransactionOutput { /* ... */ }


export class TransactionService {
    static async createTransaction(userId: number, input: ICreateTransactionInput): Promise<ITransactionOutput> {
        const { event_id, items, use_points_amount, coupon_code, voucher_code } = input;

        if (coupon_code && voucher_code) {
            throw { status: 400, message: "Hanya bisa menggunakan kupon atau voucher dalam satu transaksi, tidak keduanya." };
        }

        return prisma.$transaction(async (tx) => {
            // 1. Get User, Event, and Ticket Types
            const user = await tx.user.findUnique({ where: { id: userId }, include: { points: true } });
            if (!user) throw { status: 404, message: "Pengguna tidak ditemukan." };

            const event = await tx.event.findUnique({ where: { id: event_id } });
            if (!event) throw { status: 404, message: "Acara tidak ditemukan." };
            if (new Date() > new Date(event.start_date)) {
                throw { status: 400, message: "Tidak dapat membeli tiket untuk acara yang sudah dimulai atau berlalu." };
            }

            let grossAmount = 0;
            const transactionDetailsData: Prisma.Transactions_DetailCreateManyTransactionInput[] = [];
            const ticketTypeUpdates: { id: number; quantityToDecrement: number, name: string }[] = []; // Tambah 'name' untuk item_details

            for (const item of items) {
                const ticketType = await tx.ticket_Type.findUnique({ where: { id: item.ticket_type_id, event_id: event.id } });
                if (!ticketType) throw { status: 404, message: `Tipe tiket dengan ID ${item.ticket_type_id} tidak ditemukan untuk acara ini.` };
                if (ticketType.quantity_available < item.quantity) {
                    throw { status: 400, message: `Stok tiket ${ticketType.name} tidak mencukupi. Sisa: ${ticketType.quantity_available}.` };
                }

                const pricePerTicket = ticketType.price;
                const subtotal = pricePerTicket * item.quantity;
                grossAmount += subtotal;

                transactionDetailsData.push({
                    ticket_type_id: ticketType.id,
                    quantity: item.quantity,
                    price_per_ticket: pricePerTicket,
                    subtotal: subtotal,
                });

                ticketTypeUpdates.push({ id: ticketType.id, quantityToDecrement: item.quantity, name: ticketType.name });
            }

            if (grossAmount <= 0 && items.length > 0) {
                // Tiket gratis, tidak ada pembayaran
            } else if (grossAmount <= 0) {
                throw { status: 400, message: "Tidak ada item yang dipilih atau total harga nol." };
            }


            // 2. Apply Points
            let pointsUsedAmount = 0;
            let netAmount = grossAmount;

            if (use_points_amount && use_points_amount > 0) {
                if (!user.points || user.points.amount < use_points_amount) {
                    throw { status: 400, message: "Poin tidak mencukupi." };
                }
                if (new Date() > new Date(user.points.expired_at)) {
                    throw { status: 400, message: "Poin Anda sudah kadaluwarsa." };
                }
                pointsUsedAmount = Math.min(use_points_amount, netAmount);
                netAmount -= pointsUsedAmount;
            }

            // 3. Apply Coupon or Voucher
            let appliedCoupon: Coupons | null = null;
            let appliedVoucher: Vouchers | null = null;

            if (coupon_code) {
                appliedCoupon = await tx.coupons.findUnique({ where: { code: coupon_code, user_id: userId } });
                if (!appliedCoupon) throw { status: 400, message: "Kode kupon tidak valid." };
                if (appliedCoupon.is_used) throw { status: 400, message: "Kupon sudah digunakan." };
                if (new Date() > new Date(appliedCoupon.expired_at)) throw { status: 400, message: "Kupon sudah kadaluwarsa." };

                netAmount -= appliedCoupon.discount_value;
                if (netAmount < 0) netAmount = 0;
            } else if (voucher_code) {
                appliedVoucher = await tx.vouchers.findUnique({ where: { code: voucher_code } });
                if (!appliedVoucher) throw { status: 400, message: "Kode voucher tidak valid." };
                if (appliedVoucher.status !== "ACTIVE") throw { status: 400, message: "Voucher tidak aktif." };
                if (new Date() < new Date(appliedVoucher.start_date) || new Date() > new Date(appliedVoucher.end_date)) {
                    throw { status: 400, message: "Voucher tidak berlaku pada tanggal ini." };
                }
                if (appliedVoucher.event_id !== event.id) {
                    throw { status: 400, message: "Voucher ini tidak berlaku untuk acara ini." };
                }
                // if (appliedVoucher.user_id !== userId) throw { status: 400, message: "Voucher ini bukan milik Anda." }; // Jika voucher spesifik user

                netAmount -= appliedVoucher.discount_value;
                if (netAmount < 0) netAmount = 0;
            }

            // 4. Create Transaction in DB
            const paymentDueDate = new Date();
            paymentDueDate.setHours(paymentDueDate.getHours() + PAYMENT_DUE_HOURS);

            const newTransaction = await tx.transactions.create({
                data: {
                    user_id: userId,
                    event_id: event.id,
                    status: transaction_status.WAITING_PAYMENT,
                    gross_amount: grossAmount,
                    net_amount: netAmount,
                    used_point_amount: pointsUsedAmount,
                    used_coupon_id: appliedCoupon?.id,
                    used_voucher_id: appliedVoucher?.id,
                    payment_due_date: netAmount > 0 ? paymentDueDate : null, // Hanya set jika ada yg perlu dibayar
                    details: {
                        createMany: {
                            data: transactionDetailsData,
                        },
                    },
                },
                include: { details: true }
            });

            // 5. Update User Points, Coupon, Voucher, Ticket Stock (sementara dikurangi)
            if (pointsUsedAmount > 0 && user.points) {
                await tx.user_Points.update({
                    where: { user_id: userId },
                    data: { amount: { decrement: pointsUsedAmount } },
                });
            }
            if (appliedCoupon) {
                await tx.coupons.update({
                    where: { id: appliedCoupon.id },
                    data: { is_used: true },
                });
            }
            if (appliedVoucher) {
                await tx.vouchers.update({
                    where: { id: appliedVoucher.id },
                    data: { status: "USED" },
                });
            }

            for (const update of ticketTypeUpdates) {
                await tx.ticket_Type.update({
                    where: { id: update.id },
                    data: { quantity_available: { decrement: update.quantityToDecrement } },
                });
            }
            await tx.event.update({
                where: { id: event_id },
                data: { remaining_seats: { decrement: items.reduce((sum, item) => sum + item.quantity, 0) } }
            });


            // 6. Create Midtrans Snap Token if netAmount > 0
            let midtransSnapToken: string | null = null;
            if (netAmount > 0) {
                const midtransOrderId = `TX-${newTransaction.id}-${Date.now()}`;

                const midtransParams: midtransClient.SnapTransactionParam = {
                    transaction_details: {
                        order_id: midtransOrderId,
                        gross_amount: netAmount,
                    },
                    item_details: newTransaction.details.map(detail => {
                        // Ambil nama tipe tiket dari ticketTypeUpdates yang sudah kita kumpulkan
                        const ticketTypeInfo = ticketTypeUpdates.find(ttu => ttu.id === detail.ticket_type_id);
                        return {
                            id: detail.ticket_type_id.toString(),
                            price: detail.price_per_ticket,
                            quantity: detail.quantity,
                            name: ticketTypeInfo ? `Tiket ${event.name} - ${ticketTypeInfo.name}` : `Tiket ${event.name} - Tipe ID ${detail.ticket_type_id}`,
                            merchant_name: "FindYourTicket"
                        };
                    }),
                    customer_details: {
                        first_name: user.full_name.split(" ")[0],
                        last_name: user.full_name.split(" ").slice(1).join(" ") || user.full_name.split(" ")[0],
                        email: user.email,
                        // phone: user.phone, // Jika ada
                    },
                    callbacks: {
                        finish: `${FRONTEND_URL}/payment/finish?order_id=${midtransOrderId}`,
                    },
                };

                if (grossAmount > netAmount) {
                    midtransParams.item_details?.push({
                        id: "DISCOUNT_OR_POINTS",
                        price: -(grossAmount - netAmount),
                        quantity: 1,
                        name: "Diskon/Poin Digunakan",
                    });
                }

                const midtransTransaction = await snap.createTransaction(midtransParams);
                midtransSnapToken = midtransTransaction.token;

                await tx.transactions.update({
                    where: { id: newTransaction.id },
                    data: {
                        midtrans_order_id: midtransOrderId,
                        midtrans_snap_token: midtransSnapToken
                    },
                });
            } else { // Jika netAmount adalah 0
                const finalStatus = event.requires_organizer_confirmation
                    ? transaction_status.WAITING_CONFIRMATION
                    : transaction_status.CONFIRMED;

                let organizerConfirmationDueDate: Date | null = null;
                if (finalStatus === transaction_status.WAITING_CONFIRMATION) {
                    organizerConfirmationDueDate = new Date();
                    organizerConfirmationDueDate.setDate(organizerConfirmationDueDate.getDate() + ORGANIZER_CONFIRMATION_DUE_DAYS);
                }

                await tx.transactions.update({
                    where: { id: newTransaction.id },
                    data: {
                        status: finalStatus,
                        payment_due_date: null,
                        organizer_confirmation_due_date: organizerConfirmationDueDate,
                        midtrans_settlement_time: new Date()
                    },
                });
            }

            const finalTransactionState = await tx.transactions.findUniqueOrThrow({ where: { id: newTransaction.id } });

            return {
                id: newTransaction.id,
                user_id: newTransaction.user_id,
                event_id: newTransaction.event_id,
                status: finalTransactionState.status, // Ambil status terbaru dari DB
                gross_amount: newTransaction.gross_amount,
                net_amount: newTransaction.net_amount,
                used_point_amount: newTransaction.used_point_amount,
                used_coupon_id: newTransaction.used_coupon_id,
                used_voucher_id: newTransaction.used_voucher_id,
                midtrans_snap_token: midtransSnapToken,
                payment_due_date: finalTransactionState.payment_due_date, // Ambil dari DB
                created_at: newTransaction.created_at, // created_at dari Prisma bisa Date | null
                details: newTransaction.details.map(d => ({
                    ticket_type_id: d.ticket_type_id,
                    quantity: d.quantity,
                    price_per_ticket: d.price_per_ticket,
                    subtotal: d.subtotal
                }))
            };
        });
    }

    static async handleMidtransNotification(payload: IMidtransNotificationPayload): Promise<void> {
        console.log("Menerima notifikasi Midtrans:", JSON.stringify(payload, null, 2));

        if (!MIDTRANS_SERVER_KEY) {
            console.error("MIDTRANS_SERVER_KEY tidak diset. Tidak dapat memverifikasi notifikasi.");
            throw { status: 500, message: "Konfigurasi server Midtrans tidak lengkap." };
        }

        const keyToHash = payload.order_id + payload.status_code + payload.gross_amount + MIDTRANS_SERVER_KEY;
        const generatedSignatureKey = crypto.createHash('sha512').update(keyToHash).digest('hex');

        if (generatedSignatureKey !== payload.signature_key) {
            console.error("Signature Midtrans tidak valid.");
            throw { status: 400, message: "Notifikasi Midtrans tidak valid (signature mismatch)." };
        }

        const transaction = await prisma.transactions.findUnique({
            where: { midtrans_order_id: payload.order_id },
            include: { event: true, user: { include: { points: true } } }
        });

        if (!transaction) {
            console.warn(`Transaksi dengan Midtrans Order ID ${payload.order_id} tidak ditemukan.`);
            return;
        }

        // PERBAIKAN Error 1: Array status untuk pengecekan
        const finalStatuses: ReadonlyArray<$Enums.transaction_status> = [
            transaction_status.CONFIRMED,
            transaction_status.CANCELED,
            transaction_status.REJECTED,
            transaction_status.EXPIRED
        ];

        if (finalStatuses.includes(transaction.status) &&
            (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture')) {
            console.log(`Transaksi ${transaction.id} sudah dalam status final (${transaction.status}). Notifikasi settlement diabaikan.`);
            return;
        }

        let newStatus: $Enums.transaction_status = transaction.status;
        let midtransSettlementTime: Date | null = transaction.midtrans_settlement_time;
        let paymentDueDateUpdate: Date | null = transaction.payment_due_date;
        let organizerConfirmationDueDate: Date | null = transaction.organizer_confirmation_due_date;

        const midtransStatus = payload.transaction_status;

        if (midtransStatus === 'capture' || midtransStatus === 'settlement') {
            // Hanya update jika status belum CONFIRMED atau WAITING_CONFIRMATION
            if (transaction.status !== transaction_status.CONFIRMED && transaction.status !== transaction_status.WAITING_CONFIRMATION) {
                newStatus = transaction.event.requires_organizer_confirmation
                    ? transaction_status.WAITING_CONFIRMATION
                    : transaction_status.CONFIRMED;

                if (newStatus === transaction_status.WAITING_CONFIRMATION && !organizerConfirmationDueDate) {
                    const confirmationDue = new Date();
                    confirmationDue.setDate(confirmationDue.getDate() + ORGANIZER_CONFIRMATION_DUE_DAYS);
                    organizerConfirmationDueDate = confirmationDue;
                }

                midtransSettlementTime = payload.settlement_time ? new Date(payload.settlement_time) : new Date();
                paymentDueDateUpdate = null;
                console.log(`Transaksi ${transaction.id} berhasil dibayar. Status baru: ${newStatus}`);
            }
        } else if (midtransStatus === 'pending') {
            if (transaction.status === transaction_status.WAITING_PAYMENT) { // Hanya update jika sebelumnya WAITING_PAYMENT
                 newStatus = transaction_status.PENDING;
                 console.log(`Transaksi ${transaction.id} menunggu pembayaran (pending).`);
            }
        } else if (midtransStatus === 'deny' || midtransStatus === 'cancel') {
            if (!finalStatuses.includes(transaction.status)) { // Hanya rollback jika belum final
                newStatus = transaction_status.REJECTED; // Bisa juga CANCELED tergantung flow
                console.log(`Transaksi ${transaction.id} ditolak atau dibatalkan Midtrans.`);
                await this.rollbackTransactionResources(transaction.id, "Pembayaran ditolak/dibatalkan oleh Midtrans/Pengguna.");
            }
        } else if (midtransStatus === 'expire') {
            if (!finalStatuses.includes(transaction.status)) { // Hanya rollback jika belum final
                newStatus = transaction_status.EXPIRED;
                console.log(`Transaksi ${transaction.id} kadaluwarsa di Midtrans.`);
                await this.rollbackTransactionResources(transaction.id, "Pembayaran kadaluwarsa di Midtrans.");
            }
        } else {
            console.log(`Status notifikasi Midtrans tidak dikenal: ${midtransStatus} untuk transaksi ${transaction.id}`);
            return;
        }

        if (newStatus !== transaction.status || midtransSettlementTime !== transaction.midtrans_settlement_time) {
            await prisma.transactions.update({
                where: { id: transaction.id },
                data: {
                    status: newStatus,
                    midtrans_payment_type: payload.payment_type,
                    midtrans_transaction_time: payload.transaction_time ? new Date(payload.transaction_time) : transaction.midtrans_transaction_time,
                    midtrans_settlement_time: midtransSettlementTime,
                    payment_due_date: paymentDueDateUpdate,
                    organizer_confirmation_due_date: organizerConfirmationDueDate,
                    updated_at: new Date()
                },
            });
            console.log(`Status transaksi ID ${transaction.id} diupdate menjadi ${newStatus}.`);
        } else {
            console.log(`Tidak ada perubahan status untuk transaksi ID ${transaction.id}. Status saat ini: ${transaction.status}, Notifikasi: ${midtransStatus}`);
        }
    }

    static async confirmTransactionByOrganizer(transactionId: number, organizerUserId: number): Promise<ITransactionWithDetails> {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.transactions.findUnique({
                where: { id: transactionId },
                include: {
                    event: { include: { organizer: true } },
                    // details: true // Tidak perlu details di sini jika hanya update status
                }
            });

            if (!transaction) throw { status: 404, message: "Transaksi tidak ditemukan." };
            if (transaction.event.organizer_id !== organizerUserId) {
                throw { status: 403, message: "Anda bukan penyelenggara acara ini." };
            }
            if (transaction.status !== transaction_status.WAITING_CONFIRMATION) {
                throw { status: 400, message: `Transaksi tidak dalam status menunggu konfirmasi. Status saat ini: ${transaction.status}` };
            }

            const updatedDbTransaction = await tx.transactions.update({
                where: { id: transactionId },
                data: {
                    status: transaction_status.CONFIRMED,
                    organizer_confirmed_at: new Date(),
                    organizer_confirmation_due_date: null,
                    updated_at: new Date()
                },
                include: this.transactionIncludeClause
            });
            return updatedDbTransaction as unknown as ITransactionWithDetails; // PERBAIKAN Error 2,3,4 (casting)
        });
    }

    static async rejectTransactionByOrganizer(transactionId: number, organizerUserId: number, reason: string): Promise<ITransactionWithDetails> {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.transactions.findUnique({
                where: { id: transactionId },
                include: { 
                    event: { include: { organizer: true } },
                    // details: true, // Tidak perlu details di sini jika hanya update status & rollback
                    // user: { include: { points: true } }, // Dipindah ke rollback
                    // user_coupon: true, // Dipindah ke rollback
                    // used_voucher: true // Dipindah ke rollback
                }
            });

            if (!transaction) throw { status: 404, message: "Transaksi tidak ditemukan." };
            if (transaction.event.organizer_id !== organizerUserId) {
                throw { status: 403, message: "Anda bukan penyelenggara acara ini." };
            }
            if (transaction.status !== transaction_status.WAITING_CONFIRMATION) {
                throw { status: 400, message: `Transaksi tidak bisa ditolak. Status saat ini: ${transaction.status}` };
            }

            const updatedDbTransaction = await tx.transactions.update({
                where: { id: transactionId },
                data: {
                    status: transaction_status.REJECTED,
                    cancellation_reason: `Ditolak oleh organizer: ${reason}`,
                    organizer_confirmation_due_date: null,
                    updated_at: new Date()
                },
                include: this.transactionIncludeClause
            });

            await this.rollbackTransactionResources(transactionId, `Ditolak oleh organizer: ${reason}`, tx);
            return updatedDbTransaction as unknown as ITransactionWithDetails; // PERBAIKAN Error 2,3,4 (casting)
        });
    }

    static async cancelTransactionByUser(transactionId: number, userId: number, reason?: string): Promise<ITransactionWithDetails> {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.transactions.findUnique({
                where: { id: transactionId, user_id: userId },
                include: { 
                    event: true, 
                    // details: true, // Tidak perlu details di sini jika hanya update status & rollback
                }
            });

            if (!transaction) throw { status: 404, message: "Transaksi tidak ditemukan atau bukan milik Anda." };

            // PERBAIKAN Error 5: Array status untuk pengecekan
            const cancellableStatuses: ReadonlyArray<$Enums.transaction_status> = [
                transaction_status.WAITING_PAYMENT,
                transaction_status.PENDING
            ];
            if (!cancellableStatuses.includes(transaction.status)) {
                throw { status: 400, message: `Transaksi tidak dapat dibatalkan. Status saat ini: ${transaction.status}` };
            }

            const updatedDbTransaction = await tx.transactions.update({
                where: { id: transactionId },
                data: {
                    status: transaction_status.CANCELED,
                    cancellation_reason: reason ? `Dibatalkan oleh pengguna: ${reason}` : "Dibatalkan oleh pengguna.",
                    updated_at: new Date()
                },
                include: this.transactionIncludeClause
            });

            await this.rollbackTransactionResources(transactionId, reason ? `Dibatalkan oleh pengguna: ${reason}` : "Dibatalkan oleh pengguna.", tx);
            if (transaction.midtrans_order_id && transaction.status === transaction_status.PENDING) {
                try {
                    await coreApi.cancel(transaction.midtrans_order_id);
                    console.log(`Permintaan pembatalan ke Midtrans untuk order ${transaction.midtrans_order_id} berhasil.`);
                } catch (midtransError: any) {
                    console.error(`Gagal membatalkan transaksi di Midtrans untuk order ${transaction.midtrans_order_id}:`, midtransError.message);
                }
            }
            return updatedDbTransaction as unknown as ITransactionWithDetails; // PERBAIKAN Error 2,3,4 (casting)
        });
    }


    // Helper untuk rollback resources
    public static async rollbackTransactionResources(transactionId: number, reason: string, prismaTx?: Prisma.TransactionClient): Promise<void> {
        const currentPrisma = prismaTx || prisma;

        // PERBAIKAN Error 7, 8, 9: Tambahkan include yang benar
        const transaction = await currentPrisma.transactions.findUnique({
            where: { id: transactionId },
            include: {
                user: { include: { points: true } },
                details: true, // Dibutuhkan untuk mengembalikan stok tiket per tipe
                user_coupon: true, // Nama relasi yang benar
                used_voucher: true,
                event: true // Dibutuhkan untuk mengupdate remaining_seats
            }
        });

        if (!transaction) {
            console.error(`Rollback gagal: Transaksi ID ${transactionId} tidak ditemukan.`);
            return;
        }
        // Pastikan 'user' ada sebelum mengakses 'points'
        if (transaction.used_point_amount > 0 && transaction.user && transaction.user.points) {
            await currentPrisma.user_Points.update({
                where: { user_id: transaction.user_id },
                data: {
                    amount: { increment: transaction.used_point_amount },
                }
            });
        }

        // Pastikan 'user_coupon' ada
        if (transaction.used_coupon_id && transaction.user_coupon) {
            await currentPrisma.coupons.update({
                where: { id: transaction.used_coupon_id },
                data: { is_used: false }
            });
        }

        // Pastikan 'used_voucher' ada
        if (transaction.used_voucher_id && transaction.used_voucher) {
            await currentPrisma.vouchers.update({
                where: { id: transaction.used_voucher_id },
                data: { status: "ACTIVE" } // Pastikan $Enums.Voucher_Status.ACTIVE jika menggunakan enum
            });
        }

        let totalQuantityRestored = 0;
        // Pastikan 'details' ada
        if (transaction.details && transaction.details.length > 0) {
            for (const detail of transaction.details) {
                await currentPrisma.ticket_Type.update({
                    where: { id: detail.ticket_type_id },
                    data: { quantity_available: { increment: detail.quantity } }
                });
                totalQuantityRestored += detail.quantity;
            }
        }

        if (totalQuantityRestored > 0) {
            await currentPrisma.event.update({
                where: { id: transaction.event_id },
                data: { remaining_seats: { increment: totalQuantityRestored } }
            });
        }

        console.log(`Rollback sumber daya untuk transaksi ID ${transactionId} berhasil karena: ${reason}`);
    }

    // Helper untuk include clause pada query transaksi
    private static get transactionIncludeClause() {
        return {
            details: {
                include: {
                    ticket_type: {
                        select: { name: true, id: true } // Tambah id jika perlu
                    }
                }
            },
            event: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                    start_date: true,
                    end_date: true,
                    organizer: {
                        select: {
                            id: true,
                            full_name: true,
                            organizer_profile: {
                                select: { organization_name: true }
                            }
                        }
                    }
                }
            },
            user: {
                select: {
                    id: true,
                    full_name: true,
                    email: true
                }
            },
            user_coupon: { select: { code: true, discount_value: true } }, // PERBAIKAN Error 6: ganti used_coupon menjadi user_coupon
            used_voucher: { select: { code: true, discount_value: true }}
        };
    }

    static async getTransactionById(transactionId: number, userId?: number, userRole?: IJwt['role']): Promise<ITransactionWithDetails | null> {
        const whereClause: Prisma.TransactionsWhereInput = { id: transactionId };
        if (userId && userRole === "CUSTOMER") {
            whereClause.user_id = userId;
        }

        const transaction = await prisma.transactions.findFirst({
            where: whereClause,
            include: this.transactionIncludeClause
        });

        if (!transaction) return null;
        return transaction as unknown as ITransactionWithDetails; // PERBAIKAN Error 2,3,4 (casting)
    }

    static async getTransactionsByUser(userId: number, page: number = 1, limit: number = 10): Promise<{ transactions: ITransactionWithDetails[], total: number, currentPage: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        const transactionsData = await prisma.transactions.findMany({
            where: { user_id: userId },
            include: this.transactionIncludeClause,
            orderBy: { created_at: 'desc' },
            skip: skip,
            take: limit,
        });
        const totalTransactions = await prisma.transactions.count({ where: { user_id: userId } });

        return {
            transactions: transactionsData as unknown as ITransactionWithDetails[], // PERBAIKAN Error 2,3,4 (casting)
            total: totalTransactions,
            currentPage: page,
            totalPages: Math.ceil(totalTransactions / limit)
        };
    }

    static async getTransactionsByEventForOrganizer(eventId: number, organizerId: number, page: number = 1, limit: number = 10): Promise<{ transactions: ITransactionWithDetails[], total: number, currentPage: number, totalPages: number }> {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event || event.organizer_id !== organizerId) {
            throw { status: 403, message: "Anda tidak memiliki akses ke transaksi acara ini." };
        }

        const skip = (page - 1) * limit;
        const transactionsData = await prisma.transactions.findMany({
            where: { event_id: eventId },
            include: this.transactionIncludeClause,
            orderBy: { created_at: 'desc' },
            skip: skip,
            take: limit,
        });
        const totalTransactions = await prisma.transactions.count({ where: { event_id: eventId } });

        return {
            transactions: transactionsData as unknown as ITransactionWithDetails[], // PERBAIKAN Error 2,3,4 (casting)
            total: totalTransactions,
            currentPage: page,
            totalPages: Math.ceil(totalTransactions / limit)
        };
    }
}