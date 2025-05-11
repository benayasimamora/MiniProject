import { Router, Request, Response, NextFunction } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { authGuard, AuthRequestWithUser } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { validate } from "../middlewares/validate";
import { 
    createTransactionSchema, 
    rejectTransactionSchema,
    cancelTransactionSchema
} from "../schema/transaction.schema";

const router = Router();

// Endpoint untuk membuat transaksi baru (Checkout) - Customer
router.post(
    "/checkout",
    authGuard,
    roleGuard(["CUSTOMER"]),
    validate(createTransactionSchema),
    (req: Request, res: Response, next: NextFunction) => TransactionController.createTransaction(req as AuthRequestWithUser, res, next)
);

// Endpoint untuk menerima notifikasi dari Midtrans (Publik, tapi sebaiknya diproteksi dengan cara lain jika mungkin, misal IP Whitelisting)
// Path ini harus sama dengan yang Anda daftarkan di dashboard Midtrans (Payment Notification URL)
router.post(
    "/midtrans-notification",
    TransactionController.handleMidtransNotification
);

// Endpoint untuk customer melihat detail transaksi miliknya
router.get(
    "/:transactionId",
    authGuard,
    roleGuard(["CUSTOMER", "ORGANIZER"]), // Organizer mungkin perlu lihat detail jika ini transaksi eventnya
    (req: Request, res: Response, next: NextFunction) => TransactionController.getTransactionDetails(req as AuthRequestWithUser, res, next)
);

// Endpoint untuk customer melihat daftar transaksinya
router.get(
    "/my-transactions", // Path diubah agar lebih jelas
    authGuard,
    roleGuard(["CUSTOMER"]),
    (req: Request, res: Response, next: NextFunction) => TransactionController.listUserTransactions(req as AuthRequestWithUser, res, next)
);

// Endpoint untuk customer membatalkan transaksinya (jika status memungkinkan)
router.patch(
    "/:transactionId/cancel-by-user",
    authGuard,
    roleGuard(["CUSTOMER"]),
    validate(cancelTransactionSchema), // Alasan opsional
    (req: Request, res: Response, next: NextFunction) => TransactionController.cancelTransaction(req as AuthRequestWithUser, res, next)
);


// --- Rute untuk Organizer ---
// Endpoint untuk organizer mengkonfirmasi transaksi (jika status WAITING_CONFIRMATION)
router.patch(
    "/:transactionId/confirm-by-organizer",
    authGuard,
    roleGuard(["ORGANIZER"]),
    // validate() jika ada body yang perlu divalidasi
    (req: Request, res: Response, next: NextFunction) => TransactionController.confirmTransaction(req as AuthRequestWithUser, res, next)
);

// Endpoint untuk organizer menolak transaksi (jika status WAITING_CONFIRMATION)
router.patch(
    "/:transactionId/reject-by-organizer",
    authGuard,
    roleGuard(["ORGANIZER"]),
    validate(rejectTransactionSchema), // Alasan wajib diisi
    (req: Request, res: Response, next: NextFunction) => TransactionController.rejectTransaction(req as AuthRequestWithUser, res, next)
);

// Endpoint untuk organizer melihat daftar transaksi untuk salah satu eventnya
router.get(
    "/event/:eventId/list-for-organizer",
    authGuard,
    roleGuard(["ORGANIZER"]),
    (req: Request, res: Response, next: NextFunction) => TransactionController.listEventTransactionsForOrganizer(req as AuthRequestWithUser, res, next)
);


export default router;