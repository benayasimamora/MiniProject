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
