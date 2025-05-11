import cron from "node-cron";
import prisma from "../lib/prisma";

// setiap hari jam 00:00
export function startExpirationJobs() {
  cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    // expire points: set amount=0 jika expire lewat
    await prisma.user_Points.updateMany({
      where: { expired_at: { lte: now }, amount: { gt: 0 } },
      data: { amount: 0 },
    });
    // expire coupon
    await prisma.coupons.updateMany({
      where: { expired_at: { lte: now }, is_used: false },
      data: { is_used: true },
    });
  });
}
