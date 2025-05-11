import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;

export const SECRET_KEY = process.env.SECRET_KEY || 'your-very-strong-secret-key';
export const EXPIRES_IN = process.env.EXPIRES_IN || '1h'; // Token JWT berlaku

export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001'; // URL Frontend Anda

// Mailtrap atau Email Service
export const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
export const MAILTRAP_PORT = process.env.MAILTRAP_PORT;
export const MAILTRAP_USER = process.env.MAILTRAP_USER;
export const MAILTRAP_PASS = process.env.MAILTRAP_PASS;

// Nodemailer (jika menggunakan Gmail langsung, kurang disarankan untuk produksi)
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL;
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

// Cloudinary
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;

// Port Frontend (jika berbeda dan diperlukan secara eksplisit)
export const frontEnd_port = process.env.FRONTEND_PORT || '3001'; // Mungkin lebih baik FRONTEND_URL
