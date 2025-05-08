import { Response, NextFunction } from 'express';
import { user_role } from '@prisma/client';
import { AuthRequest } from './auth';

export function roleMiddleware(...allowedRoles: user_role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
        res.status(403).json({
            success: false,
            message: 'Forbidden: Role tidak diizinkan',
        });
        return;
        }
        next();
    };
}