import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service"; // Nama file: auth.services.ts
import { EmailService } from "../services/email.services"; // Nama file: email.services.ts
import { SECRET_KEY, APP_URL } from "../config"; // Pastikan diekspor dari config
import jwt from "jsonwebtoken";
import { ReferralService } from "../services/referral.service"; // Nama file: refferal.services.ts
import prisma from "../lib/prisma";
import { IJwt } from "../interface/auth"; // Impor IJwt

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // AuthService.register akan menangani pengiriman email verifikasi internal
      const result = await AuthService.register(req.body);
      // Pesan sukses disesuaikan karena email verifikasi dikirim dari service
      res.status(201).json({
        success: true,
        message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
        data: result // Berisi accessToken dan user info
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
          success: true,
          message: "Login berhasil",
          data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token?: string }; // query adalah string
      if (!token) {
        throw { status: 400, message: "Token verifikasi tidak ditemukan" };
      }
      if (!SECRET_KEY) {
        console.error("SECRET_KEY is not defined in config!");
        throw { status: 500, message: "Server configuration error" };
      }

      const payload = jwt.verify(token, SECRET_KEY) as IJwt; // Payload harusnya IJwt
      
      const userToVerify = await prisma.user.findUnique({ where: { id: payload.user_id }});
      if (!userToVerify) {
        throw { status: 404, message: "User tidak ditemukan untuk token ini." };
      }
      if (userToVerify.is_verified) {
        // Redirect atau kirim pesan bahwa email sudah terverifikasi
        // res.json({ success: true, message: "Email sudah terverifikasi sebelumnya." });
        return res.redirect(`${APP_URL || 'http://localhost:3001'}/login?status=email_already_verified`); // Asumsi ada halaman frontend
      }

      await prisma.user.update({
        where: { id: payload.user_id },
        data: { is_verified: true, updated_at: new Date() },
      });

      // Hanya berikan poin jika belum pernah diberikan untuk verifikasi
      await ReferralService.creditVerificationPoints(payload.user_id);

      // Redirect ke halaman sukses atau kirim JSON
      // res.json({ success: true, message: "Email berhasil diverifikasi. Anda mendapatkan +10 poin. Silakan login." });
      return res.redirect(`${APP_URL || 'http://localhost:3001'}/login?status=email_verified_success`); // Asumsi ada halaman frontend
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            // Kirim pesan spesifik atau redirect ke halaman untuk meminta token baru
            // next({ status: 401, message: "Token verifikasi sudah kedaluwarsa. Silakan minta token baru."});
            return res.redirect(`${APP_URL || 'http://localhost:3001'}/request-verification?status=token_expired`);
        }
        if (error.name === 'JsonWebTokenError') {
            // next({ status: 401, message: "Token verifikasi tidak valid."});
            return res.redirect(`${APP_URL || 'http://localhost:3001'}/request-verification?status=token_invalid`);
        }
      next(error);
    }
  }
}