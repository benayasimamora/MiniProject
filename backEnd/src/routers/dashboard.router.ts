import express from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth'; // authMiddleware dari auth.ts
import { roleGuard } from '../middlewares/roleGuard'; // Menggunakan roleGuard yang Anda miliki
import { getDashboard } from '../controllers/dashboard.controller'; // Impor controller

const router = express.Router();

// Endpoint untuk dashboard organizer
router.get(
    '/', // Path relatif terhadap mount point (misal /dashboard)
    authMiddleware, // Pastikan user terautentikasi
    roleGuard(['ORGANIZER']), // <-- PERBAIKAN DI SINI: Kirim sebagai array ['ORGANIZER']
    getDashboard // Gunakan fungsi controller
);

export default router;