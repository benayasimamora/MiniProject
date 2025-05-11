import { Router, Request, Response, NextFunction } from "express"; // Tambahkan Request, Response, NextFunction
import { authGuard, AuthRequestWithUser } from "../middlewares/authGuard"; // authGuard dan AuthRequestWithUser
import { roleGuard } from "../middlewares/roleGuard";
import { ReferralController } from "../controllers/referral.controller"; // Nama file: refferal.controller.ts

const router = Router();

// Semua endpoint referral hanya untuk CUSTOMER yang sudah login
router.use(authGuard, roleGuard(["CUSTOMER"]));

// GET /referrals - list referral yang dibuat user dan siapa yang mereferensikan user ini
router.get(
    "/", 
    (req: Request, res: Response, next: NextFunction) => ReferralController.getReferrals(req as AuthRequestWithUser, res, next)
);

// GET /referrals/rewards - lihat point dan coupon user
router.get(
    "/rewards", 
    (req: Request, res: Response, next: NextFunction) => ReferralController.getRewards(req as AuthRequestWithUser, res, next)
);

export default router;