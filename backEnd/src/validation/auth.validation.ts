import { z } from 'zod';

export const registerSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['CUSTOMER', 'ORGANIZER']), // Role ditambahkan di sini, di register.router.ts menggunakan ini
    referral_code: z.string().optional(),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email wajib diisi' })
        .email({ message: 'Format email tidak valid' }),
    password: z
        .string({ required_error: 'Password wajib diisi' })
        .min(6, { message: 'Password minimal 6 karakter' }),
});