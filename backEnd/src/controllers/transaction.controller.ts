import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { 
    ICreateTransactionInput, 
    IMidtransNotificationPayload, 
    ICancelTransactionInput 
} from "../interface/transaction.interface";
import { AuthRequestWithUser } from "../middlewares/authGuard";
import { successResponse } from "../utils/response";

export class TransactionController {
    static async createTransaction(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.user_id;
            const input: ICreateTransactionInput = req.body;
            const transactionOutput = await TransactionService.createTransaction(userId, input);
            successResponse(res, transactionOutput, "Transaksi berhasil dibuat. Silakan lanjutkan pembayaran.", 201);
        } catch (error) {
            next(error);
        }
    }

    static async handleMidtransNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const notificationPayload: IMidtransNotificationPayload = req.body;
            await TransactionService.handleMidtransNotification(notificationPayload);
            // Midtrans mengharapkan respons 200 OK jika notifikasi berhasil diterima dan diproses
            res.status(200).json({ status: "success", message: "Notifikasi berhasil diproses." });
        } catch (error: any) {
            // Jika ada error saat proses, log error tapi tetap kirim 200 ke Midtrans agar tidak retry terus-menerus untuk error yang sama.
            // Atau kirim status error (misal 500) jika ingin Midtrans retry. Tergantung jenis error.
            // Untuk signature mismatch atau data tidak valid, bisa kirim 400.
            console.error("Error handling Midtrans notification:", error);
            const statusCode = error.status && error.status < 500 ? error.status : 200; // Jangan kirim 5xx jika error client
            res.status(statusCode).json({ status: "error", message: error.message || "Gagal memproses notifikasi." });
            // next(error); // Jangan panggil next(error) agar tidak masuk global error handler yang mungkin formatnya beda
        }
    }

    static async confirmTransaction(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const transactionId = parseInt(req.params.transactionId, 10);
            const organizerUserId = req.user!.user_id;

            if (isNaN(transactionId)) {
                throw { status: 400, message: "ID transaksi tidak valid." };
            }

            const transaction = await TransactionService.confirmTransactionByOrganizer(transactionId, organizerUserId);
            successResponse(res, transaction, "Transaksi berhasil dikonfirmasi.", 200);
        } catch (error) {
            next(error);
        }
    }

    static async rejectTransaction(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const transactionId = parseInt(req.params.transactionId, 10);
            const organizerUserId = req.user!.user_id;
            const { reason } = req.body as { reason: string };


            if (isNaN(transactionId)) {
                throw { status: 400, message: "ID transaksi tidak valid." };
            }

            const transaction = await TransactionService.rejectTransactionByOrganizer(transactionId, organizerUserId, reason);
            successResponse(res, transaction, "Transaksi berhasil ditolak.", 200);
        } catch (error) {
            next(error);
        }
    }
    
    static async cancelTransaction(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const transactionId = parseInt(req.params.transactionId, 10);
            const userId = req.user!.user_id;
            const { reason } = req.body as ICancelTransactionInput;

            if (isNaN(transactionId)) {
                throw { status: 400, message: "ID transaksi tidak valid." };
            }
            
            const transaction = await TransactionService.cancelTransactionByUser(transactionId, userId, reason);
            successResponse(res, transaction, "Transaksi berhasil dibatalkan.", 200);
        } catch (error) {
            next(error);
        }
    }

    static async getTransactionDetails(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const transactionId = parseInt(req.params.transactionId, 10);
            const userId = req.user!.user_id;
            const userRole = req.user!.role;

            if (isNaN(transactionId)) {
                throw { status: 400, message: "ID transaksi tidak valid." };
            }
            
            // Customer hanya bisa lihat transaksinya, Organizer bisa lihat transaksi eventnya (perlu modifikasi service jika perlu)
            const transaction = await TransactionService.getTransactionById(transactionId, userId, userRole);
            if (!transaction) {
                throw { status: 404, message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses." };
            }
            successResponse(res, transaction, "Detail transaksi berhasil diambil.", 200);
        } catch (error) {
            next(error);
        }
    }

    static async listUserTransactions(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.user_id;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const result = await TransactionService.getTransactionsByUser(userId, page, limit);
            successResponse(res, result, "Daftar transaksi berhasil diambil.", 200);
        } catch (error) {
            next(error);
        }
    }

    static async listEventTransactionsForOrganizer(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const organizerId = req.user!.user_id;
            const eventId = parseInt(req.params.eventId, 10);
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            if (isNaN(eventId)) {
                throw { status: 400, message: "ID acara tidak valid." };
            }

            const result = await TransactionService.getTransactionsByEventForOrganizer(eventId, organizerId, page, limit);
            successResponse(res, result, `Daftar transaksi untuk acara ID ${eventId} berhasil diambil.`, 200);
        } catch (error) {
            next(error);
        }
    }
}