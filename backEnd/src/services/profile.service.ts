<<<<<<< HEAD
import prisma from '../lib/prisma'; // Impor prisma dari lib
import { IUpdateProfileInput } from '../interface/profile.interface';
import bcrypt from 'bcrypt';

// const prisma = new PrismaClient(); // Tidak perlu, sudah diimpor

export const getCustomerProfileService = async (userId: number) => {
    const user = await prisma.user.findUnique({ // Model 'User', bukan 'users'
        where: { id: userId },
        select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        referral_code: true,
        is_verified: true,
        profile_picture: true,
        points: { // Relasi User ke User_Points adalah one-to-one di schema (user_id unique)
            select: {
            amount: true,
            expired_at: true, // Mungkin ingin menampilkan expired_at juga
            },
        },
        coupons: { // Relasi User ke Coupons adalah one-to-many
            where: { is_used: false, expired_at: { gt: new Date()} }, // Hanya kupon aktif
            select: {
            id: true,
            code: true,
            discount_value: true, // Nama field di schema: discount_value
            expired_at: true,
            },
            orderBy: {
                expired_at: 'asc'
            }
        },
        // 'vouchers' di prisma schema adalah relasi User ke Vouchers (one-to-many)
        // bukan dari transactions.
        // Jika ingin menampilkan voucher yang dimiliki user:
        vouchers: {
            where: { status: 'ACTIVE', end_date: { gt: new Date() }},
            select: {
                id: true,
                code: true,
                discount_value: true,
                end_date: true,
                event: { select: { name: true }}
            },
            orderBy: {
                end_date: 'asc'
            }
        }
        // transactions: { // Ini bisa sangat banyak, mungkin tidak perlu di profil utama
        //     where: {
        //     used_voucher_id: { // Relasi ke Vouchers, bukan ID saja
        //         not: null,
        //     },
        //     },
        //     select: {
        //     used_voucher_id: true,
        //     },
        // },
        },
    });

    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    // Pastikan user.points tidak null sebelum diakses
    const totalPoints = user.points ? user.points.amount : 0;

    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        referral_code: user.referral_code,
        is_verified: user.is_verified,
        profile_picture: user.profile_picture, // Sudah benar
        point: totalPoints,
        coupons: user.coupons,
        vouchers: user.vouchers, // Ini adalah daftar voucher yang dimiliki user
    };
};

export const updateMyProfile = async (userId: number, input: IUpdateProfileInput) => {
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user) {
        throw { status: 404, message: "User tidak ditemukan" };
    }

    const updateData: any = {};

    if (input.full_name && input.full_name !== user.full_name) {
        updateData.full_name = input.full_name;
    }
    // Update profile_picture ditangani oleh service lain (updateCustomerPictureService)
    // jadi tidak perlu di sini jika input.profile_picture adalah file.
    // Jika input.profile_picture adalah URL yang sudah diupload, maka bisa diupdate di sini.
    // Berdasarkan interface, ini bisa string, jadi asumsikan URL.
    if (input.profile_picture && input.profile_picture !== user.profile_picture) {
        updateData.profile_picture = input.profile_picture;
    }

    if (input.password) {
        // Tambahkan validasi password lama jika diperlukan
        const hashed = await bcrypt.hash(input.password, 10);
        updateData.password = hashed;
    }

    if (Object.keys(updateData).length === 0) {
        throw { status: 400, message: "Tidak ada data yang diubah" };
    }

    updateData.updated_at = new Date(); // Update `updated_at`

    return prisma.user.update({ // Model 'User', bukan 'users'
        where: { id: userId },
        data: updateData,
        select: { // Hanya kembalikan data yang aman
            id: true,
            full_name: true,
            email: true,
            profile_picture: true,
            updated_at: true,
        }
    });
};
=======
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { EmailService } from "./email.services";
import { SECRET_KEY } from "../config";
import { uploadToCloudinary } from "../utils/cloudinary";

export class ProfileService {
  static async updateProfile(
    user_id: number,
    full_name: string,
    file?: Express.Multer.File
  ) {
    let url;
    if (file) {
      // upload ke cloudinary
      const result = await uploadToCloudinary(file);
      url = result.secure_url;
    }
    return prisma.user.update({
      where: { id: user_id },
      data: { full_name, profile_picture: url },
    });
  }

  static async ChangePassword(
    user_id: number,
    current: string,
    nextPwd: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) throw { status: 404, message: "User tidak ditemukan" };
    const valid = await bcrypt.compare(current, user.password);
    if (!valid) throw { status: 400, message: "Password lama salah" };
    const hash = await bcrypt.hash(nextPwd, 10);
    await prisma.user.update({
      where: { id: user_id },
      data: { password: hash },
    });
  }

  static async resetRequest(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 404, message: "Email tidak terdaftar" };
    const token = jwt.sign({ user_id: user.id }, SECRET_KEY!, {
      expiresIn: "1h",
    });
    await EmailService.sendResetPasswordEmail(email, token);
  }

  static async resetConfirm(token: string, newPwd: string) {
    const payload = jwt.verify(token, SECRET_KEY!) as any;
    const hash = await bcrypt.hash(newPwd, 10);
    await prisma.user.update({
      where: { id: payload.user_id },
      data: { password: hash },
    });
  }
}
>>>>>>> 827f6d5d8f0bfb7c4ff81713c36e16f8eb8282a5
