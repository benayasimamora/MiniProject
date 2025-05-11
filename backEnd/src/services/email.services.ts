import nodemailer from "nodemailer";
import {
  MAILTRAP_HOST,
  MAILTRAP_PASS,
  MAILTRAP_PORT,
  MAILTRAP_USER,
  // APP_URL, // Tambahkan APP_URL
} from "../config"; // Pastikan semua var ini diekspor dari config

export const transporter = nodemailer.createTransport({
  host: MAILTRAP_HOST,
  port: MAILTRAP_PORT ? +MAILTRAP_PORT : 2525, // Default port jika tidak ada
  auth: { user: MAILTRAP_USER, pass: MAILTRAP_PASS },
});

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    await transporter.sendMail({
      from: "'EventApp' <no-reply@eventapp.com>", // Sesuaikan nama aplikasi
      to,
      subject: "Verifikasi Email",
      html: `<p>Halo,</p><p>Terima kasih telah mendaftar. Silakan klik tautan berikut untuk memverifikasi alamat email Anda:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Jika Anda tidak mendaftar, abaikan email ini.</p><p>Salam,<br>Tim EventApp</p>`,
    });
  }
}