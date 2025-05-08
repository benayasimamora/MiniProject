import { PrismaClient } from '@prisma/client';
import { ILoginInput } from '../interface/interfaces';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecuresecret';

export const LoginService = async (input: ILoginInput) => {
    const { email, password } = input;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Email tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Password salah');
    }

    // Generate token JWT
    const token = jwt.sign(
        {
        id: user.id,
        email: user.email,
        role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        message: 'Login berhasil',
        token,
        user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        referral_code: user.referral_code,
        profile_picture : user.profile_picture
        },
    };
};

