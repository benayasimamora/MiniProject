import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
        schema.parse(req.body);
        next();
        } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            errors: error.errors || error.message,
        });
        return;
        }
    };
};