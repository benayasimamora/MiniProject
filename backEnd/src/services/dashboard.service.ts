import prisma from "../lib/prisma";
import { TransactionEmail } from "./transaction.email";

export class DashboardService {
  static listEvents(user_id: number) {
    return prisma.event.findMany({ where: { organizer_id: user_id } });
  }

  static updateEvent(event_id: number, data: any) {
    return prisma.event.update({
      where: { id: event_id },
      data,
    });
  }

  static deleteEvent(event_id: number) {
    return prisma.event.delete({ where: { id: event_id } });
  }

  static async getStats(user_id: number, period: "year" | "month" | "day") {
    return prisma.transactions.groupBy({
      by: ["status"],
      where: { event: { organizer_id: user_id }, status: "CONFIRMED" },
      _count: { id: true },
      _sum: { total_amount: true },
    });
  }

  static async listTransactions(user_id: number) {
    return prisma.transactions.findMany({
      where: { event: { organizer_id: user_id } },
      include: {
        details: true,
        user: { select: { full_name: true, email: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async ChangeTransactionStatus(
    txId: number,
    newStatus: "CONFIRMED" | "REJECTED",
    reason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const txRecord = await tx.transactions.update({
        where: { id: txId },
        data: { status: newStatus },
      });
      // rollback jika reject
      if (newStatus === "REJECTED") {
        // kembalikan seats & point/voucher
        const details = await tx.transactions_Detail.findMany({
          where: { transaction_id: txId },
        });
        for (const d of details) {
          await tx.event.update({
            where: { id: txRecord.event_id },
            data: { remaining_seats: { increment: d.quantity } },
          });
        }
        if (txRecord.used_point) {
          await tx.user_Points.create({
            data: {
              user_id: txRecord.user_id,
              amount: txRecord.used_point,
              source: "REFUND",
              expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          });
        }
        if (txRecord.used_voucher_id) {
          await tx.vouchers.update({
            where: { id: txRecord.used_voucher_id },
            data: { status: "ACTIVE" },
          });
        }
      }

      const user = await tx.user.findUnique({
        where: { id: txRecord.user_id },
      });
      if (user)
        await TransactionEmail.sendStatusEmail(user.email, newStatus, txId);

      return txRecord;
    });
  }

  static async listAttendees(event_id: number) {
    const details = await prisma.transactions_Detail.findMany({
      where: { transaction: { event_id, status: "CONFIRMED" } },
      include: {
        transaction: { include: { user: { select: { full_name: true } } } },
      },
    });
    return details.map((d) => ({
      user_id: d.transaction.user_id,
      full_name: d.transaction.user.full_name,
      quantity: d.quantity,
      total_paid: d.transaction.total_amount,
    }));
  }
}
