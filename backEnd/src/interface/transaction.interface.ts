import { transaction_status as PrismaTransactionStatus } from "@prisma/client";

export type transaction_status = PrismaTransactionStatus; // Menggunakan enum dari Prisma

// Input untuk membuat transaksi (checkout)
export interface ICreateTransactionInput {
    transaction_id: any;
    event_id: number;
    items: ITransactionItemInput[]; // Array item tiket yang dibeli
    use_points_amount?: number;    // Jumlah poin yang ingin digunakan (opsional)
    coupon_code?: string;          // Kode kupon (opsional)
    voucher_code?: string;         // Kode voucher (opsional)
    // payment_method_id?: string; // Jika ingin memilih metode pembayaran spesifik sebelum ke Midtrans (opsional)
}

export interface ITransactionItemInput {
    ticket_type_id: number;
    quantity: number;
}

// Output setelah membuat transaksi, termasuk token Midtrans
export interface ITransactionOutput {
    id: number;
    user_id: number;
    event_id: number;
    status: transaction_status;
    gross_amount: number;
    net_amount: number;
    used_point_amount: number;
    used_coupon_id?: number | null;
    used_voucher_id?: number | null;
    midtrans_snap_token?: string | null; // Token untuk frontend render Midtrans Snap
    payment_due_date?: Date | null;
    created_at: Date | null;
    details: ITransactionDetailOutput[];
    }

    export interface ITransactionDetailOutput {
    ticket_type_id: number;
    quantity: number;
    price_per_ticket: number;
    subtotal: number;
    }

    // Untuk detail transaksi yang ditampilkan ke user
    export interface ITransactionWithDetails extends ITransactionOutput {
        event: {
            name: string;
            location: string;
            start_date: Date;
            end_date: Date;
            organizer: {
                organizer_profile: {
                    organization_name: string;
                } | null;
            };
        };
        user: {
            full_name: string;
            email: string;
        }
    // Tambahkan informasi lain jika perlu
}


// Payload Notifikasi dari Midtrans (disederhanakan, sesuaikan dengan dokumentasi Midtrans)
// https://docs.midtrans.com/en/reference/http-notification?id=http-notification-parameter
export interface IMidtransNotificationPayload {
    transaction_time: string;
    transaction_status: MidtransTransactionStatus; // 'capture', 'settlement', 'pending', 'deny', 'cancel', 'expire'
    transaction_id: string; // Midtrans transaction_id (UUID)
    status_message: string;
    status_code: string;
    signature_key: string;
    settlement_time?: string;
    payment_type: string; // e.g., 'credit_card', 'gopay', 'bank_transfer'
    payment_amounts?: any[]; // Tergantung payment_type
    order_id: string; // ID order dari sistem kita (transaction.id atau custom UUID)
    merchant_id: string;
    gross_amount: string; // string angka
    fraud_status?: 'accept' | 'challenge' | 'deny';
    currency: string; // 'IDR'
    // ... tambahkan field lain sesuai kebutuhan dari dokumentasi Midtrans
    // Untuk bank transfer
    va_numbers?: { bank: string; va_number: string }[];
    // Untuk e-wallet (GoPay, ShopeePay)
    actions?: { name: string; method: string; url: string }[];
    // Untuk kartu kredit
    masked_card?: string;
    bank?: string;
    card_type?: string;
    approval_code?: string;
}

export type MidtransTransactionStatus =
    | 'authorize' // Untuk kartu kredit, transaksi diotorisasi
    | 'capture'   // Dana berhasil di-capture (biasanya untuk kartu kredit dengan pre-auth)
    | 'settlement'// Dana telah diterima oleh Midtrans (sukses)
    | 'pending'   // Transaksi menunggu pembayaran dari customer
    | 'deny'      // Transaksi ditolak oleh bank atau payment provider
    | 'cancel'    // Transaksi dibatalkan oleh customer atau merchant sebelum settlement
    | 'expire'    // Transaksi kadaluwarsa karena tidak dibayar
    | 'failure';  // Transaksi gagal karena alasan lain

    export interface IConfirmTransactionInput {
    // Tidak ada input spesifik, hanya ID transaksi dari params
}

export interface ICancelTransactionInput {
    reason?: string; // Alasan pembatalan (opsional)
}