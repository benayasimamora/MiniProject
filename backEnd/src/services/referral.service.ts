import prisma from "../lib/prisma";

export class ReferralService {
  // saat register menggunakan referral code
  static async handleRegistrationReferral(code: string, newUserId: number) {
    const referrer = await prisma.user.findUnique({
      where: { referral_code: code },
    });
    if (!referrer) throw { status: 400, message: "Kode referral tidak valid atau tidak ditemukan" };
    if (referrer.id === newUserId) {
        throw { status: 400, message: "Tidak dapat menggunakan kode referral sendiri." };
    }

    // create log
    await prisma.referral.create({
      data: { referrer_id: referrer.id, referree_id: newUserId }, // referree_id, bukan referee_id di schema
    });

    // credit 10 point ke referrer
    // Periksa apakah referrer sudah punya record User_Points
    const referrerPoints = await prisma.user_Points.findUnique({ where: { user_id: referrer.id }});
    if (referrerPoints) {
        await prisma.user_Points.update({
            where: { user_id: referrer.id },
            data: {
                amount: { increment: 10 },
                // expired_at bisa di-extend atau biarkan, tergantung kebijakan
                // expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan dari sekarang
            }
        });
    } else {
        await prisma.user_Points.create({
          data: {
            user_id: referrer.id,
            amount: 10,
            source: "REFERRAL",
            expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan
          },
        });
    }
    

    // generate coupon untuk referee (pengguna baru)
    await prisma.coupons.create({
      data: {
        user_id: newUserId,
        code: `WELCOME-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // Kode kupon lebih deskriptif
        discount_value: 5000, // Nilai diskon
        expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Kupon selamat datang mungkin lebih pendek, misal 1 bulan
      },
    });
  }

  // saat verifikasi email, credit point 10 ke user
  static async creditVerificationPoints(userId: number) {
    const userPoints = await prisma.user_Points.findUnique({ where: { user_id: userId }});
    if (userPoints) {
        await prisma.user_Points.update({
            where: { user_id: userId },
            data: {
                amount: { increment: 10 },
                // expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            }
        });
    } else {
        await prisma.user_Points.create({
          data: {
            user_id: userId,
            amount: 10,
            source: "REFERRAL", // Seharusnya "VERIFICATION" atau sejenisnya
            expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });
    }
  }
}