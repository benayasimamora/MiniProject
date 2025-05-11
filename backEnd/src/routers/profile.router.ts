import express, { Request, Response, NextFunction } from 'express'; // Tambahkan Request, NextFunction
import {
    deleteProfilePictureController, 
    getCustomerProfileController, 
    updateMyProfileController, 
    uploadProfilePictureController
} from '../controllers/profile.controller';
import { authGuard, AuthRequestWithUser } from '../middlewares/authGuard'; // authGuard dan AuthRequestWithUser
// import { roleMiddleware } from '../middlewares/role'; // File 'role.ts' tidak disertakan, gunakan roleGuard
import { roleGuard } from '../middlewares/roleGuard';
import { Multer } from '../utils/multer';
import { z } from 'zod'; // Untuk validasi update profil
import { validate } from '../middlewares/validate'; // Impor validate

const router = express.Router();

// Skema validasi untuk update profil
const UpdateProfileSchema = z.object({
    full_name: z.string().min(3, "Nama lengkap minimal 3 karakter").optional(),
    password: z.string().min(6, "Password baru minimal 6 karakter").optional(),
    // profile_picture tidak divalidasi di sini karena itu adalah file upload
}).refine(data => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update profil",
});


// GET Profil User (Customer atau Organizer)
// Endpoint '/me' lebih umum untuk profil user yang sedang login
router.get(
    '/me',
    authGuard,
    // Tidak perlu roleMiddleware jika semua role bisa akses profil sendiri
    (req: Request, res: Response, next: NextFunction) => getCustomerProfileController(req as AuthRequestWithUser, res, next)
);

// PUT Update Profil User (Customer atau Organizer)
router.put(
    '/me/update', // Menggunakan /me untuk konsistensi
    authGuard,
    validate(UpdateProfileSchema),
    (req: Request, res: Response, next: NextFunction) => updateMyProfileController(req as AuthRequestWithUser, res, next)
);

// PATCH Upload Foto Profil User (Customer atau Organizer)
router.patch(
    '/me/upload-picture', // Menggunakan /me
    authGuard,
    // Tidak perlu roleMiddleware jika semua role bisa upload foto profil
    Multer('memoryStorage').single('profile_picture'), // 'profile_picture' adalah nama field di form-data
    (req: Request, res: Response, next: NextFunction) => uploadProfilePictureController(req as AuthRequestWithUser, res, next)
);

// PATCH (atau DELETE) Hapus Foto Profil User
router.delete( // Menggunakan DELETE lebih semantik untuk penghapusan
    '/me/delete-picture', // Menggunakan /me
    authGuard,
    // Tidak perlu roleMiddleware jika semua role bisa hapus foto profil
    (req: Request, res: Response, next: NextFunction) => deleteProfilePictureController(req as AuthRequestWithUser, res, next)
);

export default router;