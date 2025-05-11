import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { IUserPayload } from '../interface/interfaces'; // File 'interfaces.ts' tidak disertakan

// Temporarily define IUserPayload here or ensure it's available from a provided file
// Jika IUserPayload hanya berisi id dan role, Anda bisa menggunakan IJwt dari interface/auth
import { IJwt as IUserPayload } from '../interface/auth';


const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Custom interface untuk request
export interface AuthRequest extends Request {
    user?: IUserPayload; // Menggunakan IJwt sebagai IUserPayload untuk sementara
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
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
        success: false,
        message: 'Unauthorized: token tidak valid',
        });
    }
};