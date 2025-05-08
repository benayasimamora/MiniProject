import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';

export const getDashboard = (req: AuthRequest, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to Organizer Dashboard',
        user: req.user,
    });
};