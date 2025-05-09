import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { IRegister, ILogin, AuthResponse, IJwt } from "../interface/auth";
import { ReferralService } from "./referral.service";
import { EXPIRES_IN, SECRET_KEY } from "../config";

export class AuthService {
  static async register(input: IRegister): Promise<AuthResponse> {
    const hash = await bcrypt.hash(input.password, 10);
    // generate referral code
    const referralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const user = await prisma.user.create({
      data: {
        full_name: input.full_name,
        email: input.email,
        password: hash,
        referral_code: referralCode,
      },
    });

    // jika user input referral code saat registrasi
    if (input.referralCode) {
      await ReferralService.handleRegistrationReferral(
        input.referralCode,
        user.id
      );
    }

    // kirim email verifikasi
    const token = jwt.sign(
      { user_id: user.id, role: user.role } as IJwt,
      SECRET_KEY!,
      { expiresIn: EXPIRES_IN } as jwt.SignOptions
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async login(input: ILogin): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) throw { status: 401, message: "Email tidak ditemukan" };
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw { status: 401, message: "Password salah" };
    if (!user.is_verified)
      throw { status: 403, message: "Email belum terverifikasi" };
    const token = jwt.sign(
      { user_id: user.id, role: user.role } as IJwt,
      SECRET_KEY!,
      { expiresIn: EXPIRES_IN } as jwt.SignOptions
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
