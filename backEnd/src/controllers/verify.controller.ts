import { Request, Response, NextFunction } from 'express'; // Tambahkan NextFunction
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'; // Impor prisma dari lib
// import { PrismaClient } from '@prisma/client'; // Tidak perlu, sudah diimpor
import { errorResponse, successResponse } from '../utils/response'; // Tambah successResponse
import { frontEnd_port, APP_URL, SECRET_KEY } from '../config'; // Pastikan diekspor dari config dan APP_URL untuk redirect

// const prisma = new PrismaClient(); // Tidak perlu
const JWT_SECRET = SECRET_KEY || 'supersecuresecret'; // Gunakan SECRET_KEY dari config

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        // errorResponse(res, 'Token tidak ditemukan atau tidak valid', 400);
        // return;
        // Redirect ke halaman error di frontend
        return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/verification-failed?error=invalid_token`);
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET); // Sebaiknya tipe payload lebih spesifik, misal IJwt

        const user = await prisma.user.findUnique({ where: { id: decoded.user_id } }); // Model 'User', bukan 'users', id dari payload JWT

        if (!user) {
        // errorResponse(res, 'User tidak ditemukan', 404);
        // return;
        return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/verification-failed?error=user_not_found`);
        }

        if (user.is_verified) {
        // return res.redirect(`${frontEnd_port}/email-verified-success`); // frontEnd_port mungkin hanya port, bukan URL lengkap
        return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/login?status=email_already_verified`);
        }

        await prisma.user.update({ // Model 'User', bukan 'users'
        where: { id: decoded.user_id }, // id dari payload JWT
        data: { is_verified: true, updated_at: new Date() },
        });

        // Mungkin tambahkan poin verifikasi di sini juga jika belum ditangani di controller auth
        // await ReferralService.creditVerificationPoints(decoded.user_id);

        // return res.redirect(`${frontEnd_port}/email-verified-success`);
        return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/login?status=email_verified_success`);
    } catch (error: any) {
        // errorResponse(res, 'Token tidak valid atau sudah kedaluwarsa', 401);
        // next(error); // Biarkan errorHandler menangani, atau redirect
        if (error.name === 'TokenExpiredError') {
            return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/request-verification?status=token_expired`);
        }
        return res.redirect(`${APP_URL || frontEnd_port || 'http://localhost:3001'}/verification-failed?error=token_error`);
    }
};