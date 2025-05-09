import prisma from "../lib/prisma";

export class ReferralService {
  // saat register menggunakan referral code
  static async handleRegistrationReferral(code: string, newUserId: number) {
    const referrer = await prisma.user.findUnique({
      where: { referral_code: code },
    });
    if (!referrer) throw { status: 400, message: "Referral code invalid" };
    // create log
    await prisma.referral.create({
      data: { referrer_id: referrer.id, referree_id: newUserId },
    });
    // credit 10 point
    await prisma.user_Points.create({
      data: {
        user_id: referrer.id,
        amount: 10,
        source: "REFERRAL",
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan
      },
    });
    // generate coupon untuk referee
    await prisma.coupons.create({
      data: {
        user_id: newUserId,
        code: `CPN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount_value: 5000,
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // saat verifikasi email, credit point 10 ke user
  static async creditVerificationPoints(userId: number) {
    await prisma.user_Points.create({
      data: {
        user_id: userId,
        amount: 10,
        source: "REFERRAL",
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
