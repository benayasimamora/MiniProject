import { Router, Request, Response, NextFunction } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authGuard, AuthRequestWithUser } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { validate } from "../middlewares/validate";
import { CreateReviewSchema } from "../schema/review.schema";

const router = Router();

// POST /reviews/transaction/:transactionId - Customer membuat ulasan untuk transaksi tertentu
router.post(
  "/transaction/:transactionId",
  authGuard,
  roleGuard(["CUSTOMER"]), // Hanya CUSTOMER yang bisa membuat ulasan
  validate(CreateReviewSchema),
  (req: Request, res: Response, next: NextFunction) => ReviewController.createReview(req as AuthRequestWithUser, res, next)
);

// GET /reviews/event/:eventId - Dapatkan semua ulasan untuk acara tertentu (Publik)
router.get(
    "/event/:eventId", 
    ReviewController.getEventReviews
);

// GET /reviews/organizer/:organizerId - Dapatkan semua ulasan dan peringkat rata-rata untuk penyelenggara (Publik)
router.get(
    "/organizer/:organizerId", 
    ReviewController.getOrganizerReviews
);

export default router;