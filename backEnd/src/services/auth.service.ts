import prisma from "../lib/prisma";
import { hashPassword, verifyPassword, signToken } from "../utils/auth";
import { RegisterInput, LoginInput } from "../schema/auth_Schema";
import { User } from "@prisma/client";

export class AuthService {
  // registrasi user
  static async register(input: RegisterInput) {
    const hashed = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        full_name: input.full_name,
        email: input.email,
        password: hashed,
        referral_code: generateReferralCode(),
      },
    });

    // jika ada referralcode
    if (input.referralCode) {
    }
    const token = signToken({ userId: user.id, role: user.role });
    return { user, token };
  }

  // login user
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || !(await verifyPassword(input.password, user.password))) {
      throw new Error("Email atau password salah");
    }
    const token = signToken({ userId: user.id, role: user.role });
    return { user, token };
  }
}

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
