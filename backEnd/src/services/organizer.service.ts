import prisma from "../lib/prisma";
import { OrganizerApplyDTO } from "../interface/organizer";
import { Organizer_Status, User } from "@prisma/client";
import { OrganizerEmail } from "./organizer-email.service";

export class OrganizerService {
  static async apply(user_id: number, dto: OrganizerApplyDTO) {
    // cek sudah apply pending atau approved
    const existing = await prisma.organizer_Profile.findUnique({
      where: { user_id },
    });
    if (existing) {
      if (existing.status_approval === Organizer_Status.PENDING) {
        throw { status: 400, message: "Anda memiliki pengajuan pending" };
      }
      // jika rejected, cek apakah 7 hari sudah lewat
      if (existing.status_approval === Organizer_Status.REJECTED) {
        const diff = Date.now() - existing.reviewed_at!.getTime();
        if (diff < 7 * 24 * 3600 * 1000) {
          throw {
            status: 400,
            message: "Anda bisa daftar kembali setelah 7 hari dari penolakan",
          };
        }
      }
    }

    // buat/replace apply
    const application = await prisma.organizer_Profile.upsert({
      where: { user_id },
      update: {
        ...dto,
        status_approval: Organizer_Status.PENDING,
        submitted_at: new Date(),
        reviewed_at: null,
        rejection_reason: null,
      },
      create: {
        user_id,
        ...dto,
      },
    });

    // ambil email user
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (user) {
      await OrganizerEmail.notifyPending(user.email);
    }
    return application;
  }

  static async transition(
    user_id: number,
    toStatus: Organizer_Status,
    reason?: string
  ) {
    const app = await prisma.organizer_Profile.findUnique({
      where: { user_id },
    });
    if (!app) throw { status: 400, message: "Application not found" };
    // hanya bisa dari PENDING
    if (app.status_approval !== Organizer_Status.PENDING) {
      throw {
        status: 400,
        message: "Hanya aplikasi pending yang bisa diubah status",
      };
    }
    const data: any = { status_approval: toStatus, reviewedAt: new Date() };
    if (toStatus === Organizer_Status.REJECTED) data.rejection_reason = reason;
    const updated = await prisma.organizer_Profile.update({
      where: { user_id },
      data,
    });
    // jika approve, assign role
    if (toStatus === Organizer_Status.APPROVED) {
      await prisma.user.update({
        where: { id: user_id },
        data: { role: "ORGANIZER" },
      });
    }
    return updated;
  }

  //   ambil data user dari database, dipakai controller untuk kirim email
  static async getUser(user_id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: user_id },
    });
  }
}
