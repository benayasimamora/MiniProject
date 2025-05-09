import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { ReferralController } from "../controllers/referral.controller";

const router = Router();

// semua endpoint referral hanya untuk CUSTOMER yang sudah login
router.use(authGuard, roleGuard(["CUSTOMER"]));

// list referral yang dibuat user
router.get("/", ReferralController.getReferrals);

// lihat point dan coupon user
router.get("/rewards", ReferralController.getRewards);

export default router;
