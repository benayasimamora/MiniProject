import prisma from '../lib/prisma'; // Impor prisma dari lib
// import { PrismaClient } from '@prisma/client'; // Tidak perlu
// Define IRegisterInput directly in this file
interface IRegisterInput {
    full_name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    referral_code?: string;
}
// Definisikan IRegisterInput sementara jika belum ada
// interface IRegisterInput {
//     full_name: string;
//     email: string;
//     password: string;
//     role: 'CUSTOMER' | 'ORGANIZER'; // Sesuai auth.validation.ts
//     referral_code?: string;
// }
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/sendverificationemail';
import { SECRET_KEY, APP_URL } from '../config'; // Pastikan diekspor dari config



// const prisma = new PrismaClient(); // Tidak perlu

// Pastikan IRegisterInput didefinisikan dengan benar
// Jika mengambil dari validation/auth.validation.ts, role seharusnya ada
type ActualRegisterInput = {
    full_name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    referral_code?: string;
};


export const RegisterService = async (input: ActualRegisterInput) => {
    const { full_name, email, password, role, referral_code } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw { status: 409, message: 'Email sudah terdaftar' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Membuat referral code yang lebih unik dan mungkin lebih pendek
    const nameCode = full_name.substring(0, 3).toUpperCase();
    const newReferralCode = `${nameCode}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;


    const result = await prisma.$transaction(async (tx) => {
        // 1. Validasi referral jika digunakan
        let referrer = null;
        if (referral_code) {
        referrer = await tx.user.findFirst({ // Model 'User', bukan 'users'
            where: { referral_code },
        });

        if (!referrer) {
            throw { status: 400, message: 'Kode referral tidak valid atau tidak ditemukan' };
        }
        if (referrer.email === email) { // Tidak bisa referral diri sendiri
            throw { status: 400, message: 'Tidak dapat menggunakan kode referral sendiri.' };
        }
        }

        // 2. Buat user baru
        const newUser = await tx.user.create({ // Model 'User', bukan 'users'
        data: {
            full_name,
            email,
            password: hashedPassword,
            role: role || 'CUSTOMER', // Default ke CUSTOMER jika tidak ada
            referral_code: newReferralCode,
            is_verified: false,
        },
        });

        // 3. Jika referral valid, beri reward
        if (referrer) {
        const now = new Date();
        const expired = new Date();
        expired.setMonth(now.getMonth() + 3); // Poin berlaku 3 bulan

        // Beri poin ke referrer
        const referrerPoints = await tx.user_Points.findUnique({ where: { user_id: referrer.id }});
        if (referrerPoints) {
            await tx.user_Points.update({
                where: { user_id: referrer.id },
                data: { amount: { increment: 10000 }} // Asumsi 10000 poin
            });
        } else {
            await tx.user_Points.create({ // Model 'User_Points', bukan 'points'
                data: {
                user_id: referrer.id,
                amount: 10000, // Jumlah poin
                source: 'REFERRAL',
                expired_at: expired,
                },
            });
        }
        

        // Beri kupon ke pengguna baru (referee)
        await tx.coupons.create({
            data: {
            user_id: newUser.id,
            code: `WELCOME-${Date.now().toString().slice(-5)}`,
            discount_value: 10000, // Nilai diskon
            expired_at: expired, // Kupon berlaku 3 bulan
            is_used: false,
            },
        });

        // Catat log referral
        await tx.referral.create({ // Model 'Referral', bukan 'referral_logs'
            data: {
            referrer_id: referrer.id,
            referree_id: newUser.id, // referree_id di schema
            },
        });
    }

    // 4. Buat token verifikasi
    if (!SECRET_KEY) throw new Error("JWT_SECRET is not defined");
    const verifyToken = jwt.sign(
        { user_id: newUser.id, email: newUser.email }, // Payload: user_id, bukan id
        SECRET_KEY,
        { expiresIn: '1d' } // Token verifikasi berlaku 1 hari
    );

    // 5. Kirim email verifikasi
    const verificationLink = `${APP_URL || 'http://localhost:5000'}/auth/verify-email?token=${verifyToken}`; // Menggunakan path dari auth.ts router
    await sendVerificationEmail(newUser.email, newUser.full_name, verificationLink);

    return { // Kembalikan data user yang relevan
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        referral_code: newUser.referral_code,
        };
    });

    return {
        message: 'Registrasi berhasil. Silakan cek email Anda untuk memverifikasi akun.',
        user: result, // Mengandung data user yang baru dibuat
    };
};