import { Request, Response, NextFunction } from 'express'; // Tambahkan NextFunction
import { RegisterService } from '../services/register.services'; // Nama file: register.services.ts
// import { IRegisterInput } from '../interfaces/interfaces'; // File 'interfaces.ts' tidak disertakan
// Definisikan IRegisterInput sesuai kebutuhan RegisterService
type ActualRegisterInput = {
    full_name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ORGANIZER'; // Sesuai auth.validation.ts
    referral_code?: string;
};
import { successResponse, errorResponse } from '../utils/response';

export const RegisterController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const input: ActualRegisterInput = req.body; // Pastikan tipe input sesuai
        const result = await RegisterService(input);

        // RegisterService sudah mengembalikan message dan user data
        successResponse(res, result.user, result.message, 201);
    } catch (error: any) {
        // errorResponse(res, error.message || 'Terjadi kesalahan saat registrasi', error.status || 400);
        next(error); // Biarkan errorHandler menangani
    }
};