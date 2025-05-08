import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUserPayload } from '../interface/interfaces';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Custom interface untuk request
export interface AuthRequest extends Request {
    user?: IUserPayload;
}

// Middleware untuk verifikasi JWT token
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
        success: false,
        message: 'Unauthorized: token tidak ditemukan',
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as IUserPayload;
        req.user = decoded; // sekarang aman, karena pakai AuthRequest
        next();
    } catch (err) {
        res.status(401).json({
        success: false,
        message: 'Unauthorized: token tidak valid',
        });
    }
};