import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { EmailService } from "../services/email.services";
import { SECRET_KEY } from "../config";
import jwt from "jsonwebtoken";
import { ReferralService } from "../services/referral.service";
import prisma from "../lib/prisma";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      // kirim email verifikasi
      await EmailService.sendVerificationEmail(
        result.user.email,
        result.accessToken
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as any;
      const payload = jwt.verify(token, SECRET_KEY!) as any;
      await prisma.user.update({
        where: { id: payload.user_id },
        data: { is_verified: true },
      });
      await ReferralService.creditVerificationPoints(payload.user_id);
      res.json({ success: true, message: "Email terverifikasi. +10 poin" });
    } catch (error) {
      next(error);
    }
  }
}
