import { z } from 'zod';

export const transactionItemSchema = z.object({
    ticket_type_id: z.number({ required_error: "ID tipe tiket wajib diisi" }).int().positive("ID tipe tiket harus positif"),
    quantity: z.number({ required_error: "Kuantitas wajib diisi" }).int().min(1, "Kuantitas minimal 1")
});

export const createTransactionSchema = z.object({
    event_id: z.number({ required_error: "ID acara wajib diisi" }).int().positive("ID acara harus positif"),
    items: z.array(transactionItemSchema).min(1, "Minimal satu item tiket harus dipilih"),
    use_points_amount: z.number().int().nonnegative("Jumlah poin tidak boleh negatif").optional(),
    coupon_code: z.string().trim().min(1, "Kode kupon tidak boleh kosong").optional().or(z.literal('')), // Boleh string atau string kosong
    voucher_code: z.string().trim().min(1, "Kode voucher tidak boleh kosong").optional().or(z.literal('')),
}).refine(data => !(data.coupon_code && data.voucher_code), {
    message: "Hanya bisa menggunakan kupon atau voucher dalam satu transaksi, tidak keduanya.",
    path: ["coupon_code"], // atau path: ["voucher_code"]
});

// Skema untuk input konfirmasi oleh organizer (jika ada body yang diperlukan)
// Untuk saat ini, hanya ID dari params, jadi tidak ada schema body khusus
export const confirmTransactionSchema = z.object({}); // Kosong jika tidak ada body

// Skema untuk input pembatalan oleh organizer (jika ada body yang diperlukan)
export const rejectTransactionSchema = z.object({
    reason: z.string({ required_error: "Alasan penolakan wajib diisi."})
                .trim()
                .min(10, "Alasan penolakan minimal 10 karakter.")
                .max(255, "Alasan penolakan maksimal 255 karakter."),
});

export const cancelTransactionSchema = z.object({
    reason: z.string().trim().min(10).max(255).optional(), // Alasan opsional untuk pembatalan oleh customer
});