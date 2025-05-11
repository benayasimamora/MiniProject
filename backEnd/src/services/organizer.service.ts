import prisma from "../lib/prisma";
import { OrganizerApplyDTO } from "../interface/organizer";
import { Organizer_Status, User } from "@prisma/client";
import { OrganizerEmail } from "./organizer-email.service"; // Nama file: organizer-email.services.ts
import { ReviewService } from "./review.service"; // BARU: Impor ReviewService

export class OrganizerService {
  static async apply(user_id: number, dto: OrganizerApplyDTO) {
    const userMakingApplication = await prisma.user.findUnique({ where: { id: user_id }});
    if (!userMakingApplication) {
        throw { status: 404, message: "User tidak ditemukan" };
    }
    if (userMakingApplication.role === "ORGANIZER") {
        throw { status: 400, message: "Anda sudah menjadi organizer." };
    }


    // cek sudah apply pending atau approved
    const existing = await prisma.organizer_Profile.findUnique({
      where: { user_id }, // Relasi di Prisma schema user_id unik
    });

    if (existing) {
      if (existing.status_approval === Organizer_Status.APPROVED) {
          throw { status: 400, message: "Anda sudah terdaftar sebagai organizer."};
      }
      if (existing.status_approval === Organizer_Status.PENDING) {
        throw { status: 400, message: "Anda memiliki pengajuan yang sedang diproses (pending)" };
      }
      // jika rejected, cek apakah 7 hari sudah lewat
      if (existing.status_approval === Organizer_Status.REJECTED) {
        if (!existing.reviewed_at) { // Jika reviewed_at null, ini kondisi aneh
            throw { status: 500, message: "Data pengajuan sebelumnya tidak lengkap."};
        }
        const diff = Date.now() - new Date(existing.reviewed_at).getTime();
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
        if (diff < sevenDaysInMillis) {
          const remainingTime = sevenDaysInMillis - diff;
          const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
          throw {
            status: 400,
            message: `Anda bisa mendaftar kembali setelah ${remainingDays} hari dari penolakan terakhir.`,
          };
        }
      }
    }

    // buat/replace apply
    const application = await prisma.organizer_Profile.upsert({
      where: { user_id },
      update: {
        organization_name: dto.organization_name,
        organization_email: dto.organization_email,
        phone_number: dto.phone_number,
        address: dto.address,
        website_url: dto.website_url,
        status_approval: Organizer_Status.PENDING,
        submitted_at: new Date(),
        reviewed_at: null,
        rejection_reason: null,
      },
      create: {
        user_id,
        organization_name: dto.organization_name,
        organization_email: dto.organization_email,
        phone_number: dto.phone_number,
        address: dto.address,
        website_url: dto.website_url,
        // status_approval default PENDING dari schema, submitted_at default now()
      },
    });

    if (userMakingApplication) {
      await OrganizerEmail.notifyPending(userMakingApplication.email, application.organization_name);
    }
    return application;
  }

  static async transition(
    user_id_to_change: number, // Ganti nama agar lebih jelas
    toStatus: Organizer_Status,
    reason?: string
  ) {
    const app = await prisma.organizer_Profile.findUnique({
      where: { user_id: user_id_to_change },
      include: { user: true } // Sertakan data user untuk email
    });
    if (!app) throw { status: 404, message: `Pengajuan untuk user ID ${user_id_to_change} tidak ditemukan` };
    
    // hanya bisa dari PENDING
    if (app.status_approval !== Organizer_Status.PENDING) {
      throw {
        status: 400,
        message: "Hanya aplikasi dengan status PENDING yang bisa diubah statusnya.",
      };
    }
    
    if (toStatus === Organizer_Status.REJECTED && !reason) {
        throw { status: 400, message: "Alasan penolakan wajib diisi jika status diubah menjadi REJECTED."};
    }

    const dataToUpdate: any = { 
        status_approval: toStatus, 
        reviewed_at: new Date() // reviewed_at di schema Anda nullable, jadi pastikan ini benar
    };
    if (toStatus === Organizer_Status.REJECTED) {
        dataToUpdate.rejection_reason = reason;
    } else {
        dataToUpdate.rejection_reason = null; // Hapus alasan jika di-approve
    }

    const updatedApplication = await prisma.organizer_Profile.update({
      where: { user_id: user_id_to_change },
      data: dataToUpdate,
    });

    // jika approve, assign role
    if (toStatus === Organizer_Status.APPROVED) {
      await prisma.user.update({
        where: { id: user_id_to_change },
        data: { role: "ORGANIZER" },
      });
    }

    // Kirim email notifikasi hasil
    if (app.user) {
        await OrganizerEmail.notifyResult(app.user.email, app.organization_name, toStatus, reason);
    }

    return updatedApplication;
  }

  //   ambil data user dari database, dipakai controller untuk kirim email
  static async getUser(user_id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: user_id },
    });
  }

  // BARU: Metode untuk mendapatkan profil publik organizer
  static async getPublicProfile(organizerUserId: number) {
    const organizerUser = await prisma.user.findUnique({
      where: { id: organizerUserId, role: "ORGANIZER" },
      select: {
        id: true,
        full_name: true,
        profile_picture: true,
        created_at: true, // Kapan user ini bergabung
        organizer_profile: {
          select: {
            organization_name: true,
            organization_email: true, // Mungkin perlu disembunyikan untuk publik
            phone_number: true,       // Mungkin perlu disembunyikan untuk publik
            address: true,
            website_url: true,
            submitted_at: true, // Kapan profil organizer disubmit/diupdate
          }
        },
        // Ambil event yang dimiliki organizer ini
        Event: {
            where: { start_date: { gte: new Date() }}, // Hanya event mendatang atau semua?
            orderBy: { start_date: 'asc' },
            take: 5, // Batasi jumlah event yang ditampilkan di profil
            select: {
                id: true,
                name: true,
                start_date: true,
                location: true,
                category: true,
            }
        }
      },
    });

    if (!organizerUser) {
      throw { status: 404, message: "Penyelenggara tidak ditemukan atau pengguna bukan penyelenggara." };
    }

    const reviewsData = await ReviewService.getReviewsAndRatingByOrganizer(organizerUserId);

    return {
      organizer_details: organizerUser,
      rating_summary: {
        averageRating: reviewsData.averageRating,
        totalReviews: reviewsData.totalReviews,
      },
      // Anda bisa memilih untuk menampilkan beberapa ulasan terbaru di sini
      // recent_reviews: reviewsData.reviews.slice(0, 3) 
    };
  }
}