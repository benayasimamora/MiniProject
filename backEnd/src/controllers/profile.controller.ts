import { Response, Request, NextFunction } from 'express'; // Tambahkan Request, NextFunction
import { updateMyProfile, getCustomerProfileService} from '../services/profile.service'; // Nama file: profile.services.ts
import { successResponse, errorResponse } from '../utils/response';
import { updatePictureService } from '../services/updateCustomerServices'; // Adjusted file path or name
import { AuthRequestWithUser } from '../middlewares/authGuard'; // Ganti ke AuthRequestWithUser
import { deleteCustomerPictureService } from '../services/delete.customer.picture.services'; // Nama file: delete.customer.picture.services.ts

// Ambil Data Profile
export const getCustomerProfileController = async (
    req: AuthRequestWithUser, // Ganti ke AuthRequestWithUser
    res: Response,
    next: NextFunction // Tambahkan next
): Promise<void> => {
    try {
        const userId = req.user!.user_id; // user_id dari token
        // Tidak perlu cek !userId karena authGuard sudah memastikan user ada
        const profile = await getCustomerProfileService(userId);
        successResponse(res, profile, 'Berhasil mengambil profil customer');
    } catch (err: any) {
        // errorResponse(res, err.message || 'Gagal mengambil profil customer', err.status || 500);
        next(err);
    }
};

//  Upload Foto Profil
export const uploadProfilePictureController = async (
    req: AuthRequestWithUser, // Ganti ke AuthRequestWithUser
    res: Response,
    next: NextFunction // Tambahkan next
    ): Promise<void> => {
    try {
        const userId = req.user!.user_id; // user_id dari token

        if (!req.file) {
            // errorResponse(res, 'File tidak ditemukan. Pastikan Anda mengupload file dengan field name "profile_picture"', 400);
            // return;
            throw { status: 400, message: 'File tidak ditemukan. Pastikan Anda mengupload file dengan field name "profile_picture"'};
        }

        const result = await updatePictureService(userId, req.file);
        successResponse(res, { url: result.secure_url }, result.message);
    } catch (err: any) {
        // errorResponse(res, err.message || 'Gagal upload foto profil', err.status || 500);
        next(err);
    }
};

export const deleteProfilePictureController = async (
    req: AuthRequestWithUser, // Ganti ke AuthRequestWithUser
    res: Response,
    next: NextFunction // Tambahkan next
    ): Promise<void> => {
    try {
        const userId = req.user!.user_id; // user_id dari token
        const result = await deleteCustomerPictureService(userId);
        successResponse(res, null, result.message, 200); // Tidak ada data yang dikembalikan
    } catch (err: any) {
        // res.status(err.status || 500).json({ // Status dari error jika ada
        // success: false,
        // message: err.message || 'Gagal menghapus foto profil',
        // });
        next(err);
    }
};

export const updateMyProfileController = async (
    req: AuthRequestWithUser, // Ganti ke AuthRequestWithUser
    res: Response,
    next: NextFunction // Tambahkan next
    ): Promise<void> => {
    try {
        const userId = req.user!.user_id; // user_id dari token
        const updatedUser = await updateMyProfile(userId, req.body);
        successResponse(res, updatedUser, 'Profil berhasil diperbarui');
    } catch (err: any) {
        // errorResponse(res, err.message || 'Gagal memperbarui profil', err.status || 500);
        next(err);
    }
};