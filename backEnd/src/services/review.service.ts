import prisma from "../lib/prisma";
import { ICreateReviewInput } from "../interface/review.interface";
import { transaction_status } from "@prisma/client";

export class ReviewService {
    static async createReview(
        userId: number,
        transactionId: number,
        input: ICreateReviewInput
    ) {
        const transaction = await prisma.transactions.findUnique({
        where: { id: transactionId },
        include: { event: true }, // Untuk memeriksa tanggal akhir event
        });

        if (!transaction) {
        throw { status: 404, message: "Transaksi tidak ditemukan" };
        }

        if (transaction.user_id !== userId) {
        throw { status: 403, message: "Anda hanya dapat mengulas transaksi Anda sendiri" };
        }

        if (transaction.status !== transaction_status.CONFIRMED) {
        // Anda bisa lebih spesifik, misal hanya 'CONFIRMED' yang boleh review
        throw { status: 400, message: "Status transaksi tidak memungkinkan untuk memberikan ulasan (misalnya, harus CONFIRMED)" };
        }

        // Periksa apakah acara telah berakhir
        if (new Date() < new Date(transaction.event.end_date)) {
        throw { status: 400, message: "Tidak dapat memberikan ulasan untuk acara yang belum berakhir" };
        }

        const existingReview = await prisma.reviews.findUnique({
        where: { transaction_id: transactionId }, // Review unik per transaksi
        });

        if (existingReview) {
        throw { status: 409, message: "Anda sudah pernah memberikan ulasan untuk transaksi ini" };
        }

        return prisma.reviews.create({
        data: {
            user_id: userId,
            transaction_id: transactionId,
            event_id: transaction.event_id, // Ambil event_id dari transaksi
            rating: input.rating,
            comment: input.comment,
        },
        select: { // Pilih field yang ingin dikembalikan
            id: true,
            rating: true,
            comment: true,
            created_at: true,
            user: { select: { full_name: true }},
            event: { select: { name: true }}
        }
        });
    }

    static async getReviewsByEvent(eventId: number) {
        const eventExists = await prisma.event.findUnique({ where: { id: eventId }});
        if (!eventExists) {
            throw { status: 404, message: `Acara dengan ID ${eventId} tidak ditemukan`};
        }

        return prisma.reviews.findMany({
        where: { event_id: eventId },
        orderBy: { created_at: "desc" },
        include: {
            user: {
            select: {
                id: true,
                full_name: true,
                profile_picture: true,
            },
            },
            // Tidak perlu include event lagi karena sudah difilter by event_id
        },
        });
    }

    static async getReviewsAndRatingByOrganizer(organizerUserId: number) {
        const organizerExists = await prisma.user.findUnique({ where: {id: organizerUserId, role: "ORGANIZER"}});
        if (!organizerExists) {
            throw { status: 404, message: `Penyelenggara dengan ID ${organizerUserId} tidak ditemukan`};
        }
        
        const reviews = await prisma.reviews.findMany({
        where: {
            event: { // Cari review dari event yang dimiliki organizer ini
            organizer_id: organizerUserId,
            },
        },
        include: {
            user: { // Pengguna yang menulis review
            select: {
                id: true,
                full_name: true,
                profile_picture: true,
            },
            },
            event: { // Event yang direview
                select: {
                    id: true,
                    name: true,
                }
            }
        },
        orderBy: { created_at: "desc" },
        });

        if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            reviews: [],
        };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

        return {
        averageRating,
        totalReviews: reviews.length,
        reviews, // Kirim semua ulasan
        };
    }
}