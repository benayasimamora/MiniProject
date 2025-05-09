import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { ReferralService } from "../services/referral.service";

export class ReferralController {
  // list referral log oleh user (sebagai referrer)
  static async getReferrals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const referrals = await prisma.referral.findMany({
        where: { referrer_id: userId },
        orderBy: { created_at: "desc" },
      });
      res.json({ status: "success", data: "referrals" });
    } catch (error) {
      next(error);
    }
  }
  // tampilkan total point dan coupon aktif user
  static async getRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      // ambil saldo terakhir
      const pointsRecord = await prisma.user_Points.findUnique({
        where: { user_id: userId },
      });
      const points = pointsRecord?.amount ?? 0;
      // ambil coupon aktif
      const coupon = await prisma.coupons.findMany({
        where: {
          user_id: userId,
          is_used: false,
          expired_at: { gt: new Date() },
        },
      });
      res.json({ status: "success", data: { points, coupon } });
    } catch (error) {
      next(error);
    }
  }
}
