import nodemailer from "nodemailer";
import {
  MAILTRAP_HOST,
  MAILTRAP_PASS,
  MAILTRAP_PORT,
  MAILTRAP_USER,
} from "../config";

export const transporter = nodemailer.createTransport({
  host: MAILTRAP_HOST,
  port: +MAILTRAP_PORT!,
  auth: { user: MAILTRAP_USER, pass: MAILTRAP_PASS },
});

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    await transporter.sendMail({
      from: "'EventApp' <no-reply@eventapp.com",
      to,
      subject: "Verifikasi Email",
      html: `<p>Click <a href="${verificationLink}">di sini</a> untuk verifikasi email anda.</p>`,
    });
  }

  static async sendResetPasswordEmail(to: string, token: string) {
    const url = `${process.env.APP_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: "'EventApp' <no-reply@eventapp.com>",
      to,
      subject: "Reset Password",
      html: `
      <p>Anda meminta reset password. Klik link berikut untuk mengatur ulang:</p>
      <a href="${url}">${url}</a>
      <p>Link ini berlaku 1 jam.</p>`,
    });
  }
}
