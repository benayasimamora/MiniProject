import { Response, Request, NextFunction } from 'express'; // Tambahkan Request, NextFunction
// import { updateMyProfile, getCustomerProfileService} from '../services/profile.service'; // Ini sepertinya salah copy, harusnya dari referral service
// import { successResponse, errorResponse } from '../utils/response';
// import { updatePictureService } from '../services/updateCustomerPictureService'; // Salah copy
import { AuthRequestWithUser } from '../middlewares/authGuard'; // Ganti ke AuthRequestWithUser
// import { deleteCustomerPictureService } from '../services/deleteCustomerPictureService'; // Salah copy
import prisma from '../lib/prisma'; // Untuk mengambil data referral
import { successResponse } from '../utils/response';


// Ini adalah controller untuk Referral, bukan Profile
// Mari kita buat fungsi yang sesuai untuk Referral
export class ReferralController {
    // GET /referrals - list referral yang dibuat user (siapa saja yang diajak)
    static async getReferrals(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.user_id;
            const referralsMade = await prisma.referral.findMany({
                where: { referrer_id: userId },
                include: {
                    referee: { // User yang direferensikan
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            created_at: true,
                            is_verified: true,
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            });

            const referredBy = await prisma.referral.findFirst({
                where: { referree_id: userId }, // referree_id sesuai schema
                include: {
                    referrer: { // User yang mereferensikan
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        }
                    }
                }
            });

            successResponse(res, {
                referrals_made: referralsMade,
                referred_by: referredBy ? referredBy.referrer : null,
            }, "Data referral berhasil diambil.");

        } catch (error) {
            next(error);
        }
    }

    // GET /referrals/rewards - lihat point dan coupon user
    static async getRewards(req: AuthRequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.user_id;
            const userPoints = await prisma.user_Points.findUnique({
                where: { user_id: userId }
            });
            const userCoupons = await prisma.coupons.findMany({
                where: { user_id: userId, is_used: false, expired_at: { gt: new Date() } },
                orderBy: { expired_at: 'asc' }
            });

            successResponse(res, {
                points: userPoints ? userPoints.amount : 0,
                coupons: userCoupons
            }, "Data poin dan kupon berhasil diambil.");

        } catch (error) {
            next(error);
        }
    }
}