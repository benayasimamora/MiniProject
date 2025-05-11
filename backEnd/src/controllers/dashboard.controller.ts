import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth'; 

export const getDashboard = (req: AuthRequest, res: Response): void => { 
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Akses ditolak. Pengguna tidak terautentikasi.',
        });
        return; // Return setelah mengirim respons
    }

    res.status(200).json({
        success: true,
        message: 'Selamat datang di Dashboard Organizer',
        user: {
            user_id: req.user.user_id,
            role: req.user.role,
        },
    });
};