import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
});

export async function sendVerificationEmail(email: string, name: string, link: string) {
    // Pastikan path ke template benar relatif terhadap CWD (Current Working Directory)
    // Atau gunakan path absolut jika lebih aman
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'verify-email.hbs');
    // Pastikan file template ada
    if (!fs.existsSync(templatePath)) {
        console.error(`Template email tidak ditemukan di: ${templatePath}`);
        throw new Error(`Template email tidak ditemukan.`);
    }
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    const html = template({ name, link }); // 'link' di sini adalah verifyUrl lengkap

    await transporter.sendMail({
        from: `"FindYourTicket" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Verifikasi Akun Anda',
        html,
    });
}