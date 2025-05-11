import prisma from "../lib/prisma";

export class ReferralService {
  // saat register menggunakan referral code
  static async handleRegistrationReferral(code: string, newUserId: number) {
    const referrer = await prisma.user.findUnique({
      where: { referral_code: code },
    });
    if (!referrer) throw { status: 400, message: "Referral code invalid" };
    // rekam referral
    await prisma.referral.create({
      data: { referrer_id: referrer.id, referree_id: newUserId },
    });

    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 3);

    // credit 10000 point
    await prisma.user_Points.create({
      data: {
        user_id: referrer.id,
        amount: 10000,
        source: "REFERRAL",
        expired_at: expireDate,
      },
    });
    // generate coupon untuk referee
    await prisma.coupons.create({
      data: {
        user_id: newUserId,
        code: `CPN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount_value: 5000,
        expired_at: expireDate,
      },
    });
  }

  // saat verifikasi email, credit point 10 ke user
  static async creditVerificationPoints(userId: number) {
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 3);

    await prisma.user_Points.create({
      data: {
        user_id: userId,
        amount: 10,
        source: "REFERRAL",
        expired_at: expireDate,
      },
    });
  }
}
