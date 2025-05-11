import nodemailer from 'nodemailer';
import hbs from 'handlebars'; // Seharusnya handlebars
import fs from 'fs';
import path from 'path';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
    });

    export const sendVerificationEmail = async ( // Fungsi ini sepertinya duplikat dengan yang ada di sendverificationemail.ts
    to: string,
    name: string,
    token: string // Token di sini, tapi di sendverificationemail.ts adalah link
    ) => {
    const templatePath = path.join(__dirname, '../templates/verify-email.hbs'); // Pastikan folder templates ada
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = hbs.compile(source);

    const html = template({
        name,
        // BASE_URL harus didefinisikan di .env
        verifyUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`,
    });

    await transporter.sendMail({
        from: `"FindYourTicket" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject: 'Verifikasi Akun Anda',
        html,
    });
};