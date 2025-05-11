import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { ICreateReviewInput } from "../interface/review.interface";
import { AuthRequestWithUser } from "../middlewares/authGuard"; // Menggunakan interface dari authGuard
import { successResponse } from "../utils/response";

export class ReviewController {
    static async createReview(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
        const userId = req.user!.user_id;
        const transactionId = parseInt(req.params.transactionId, 10);
        const input: ICreateReviewInput = req.body;

        if (isNaN(transactionId)) {
            throw { status: 400, message: "ID transaksi tidak valid" };
        }

        const review = await ReviewService.createReview(userId, transactionId, input);
        successResponse(res, review, "Ulasan berhasil dikirim", 201);
        } catch (error) {
        next(error);
        }
    }

    static async getEventReviews(req: Request, res: Response, next: NextFunction) {
        try {
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            throw { status: 400, message: "ID acara tidak valid" };
        }
        const reviews = await ReviewService.getReviewsByEvent(eventId);
        successResponse(res, reviews, `Ulasan untuk acara ID ${eventId} berhasil diambil.`);
        } catch (error) {
        next(error);
        }
    }

    static async getOrganizerReviews(req: Request, res: Response, next: NextFunction) {
        try {
        const organizerId = parseInt(req.params.organizerId, 10);
        if (isNaN(organizerId)) {
            throw { status: 400, message: "ID penyelenggara tidak valid" };
        }
        const result = await ReviewService.getReviewsAndRatingByOrganizer(organizerId);
        successResponse(res, result, `Ulasan dan peringkat untuk penyelenggara ID ${organizerId} berhasil diambil.`);
        } catch (error) {
        next(error);
        }
    }
}