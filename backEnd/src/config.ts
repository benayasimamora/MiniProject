import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";
export const EXPIRES_IN = process.env.EXPIRES_IN || "1d";
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // Ganti dengan URL frontend Anda

// Database
export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;

// Email (Mailtrap or Gmail)
export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL;
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS;
export const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
export const MAILTRAP_PORT = process.env.MAILTRAP_PORT;
export const MAILTRAP_USER = process.env.MAILTRAP_USER;
export const MAILTRAP_PASS = process.env.MAILTRAP_PASS;

// Cloudinary
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;

// Midtrans Configuration
export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxxxxxxxxxxx";
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxxxxxxxxxxx";
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Transaction settings
export const PAYMENT_DUE_HOURS = parseInt(process.env.PAYMENT_DUE_HOURS || "2", 10);
export const ORGANIZER_CONFIRMATION_DUE_DAYS = parseInt(process.env.ORGANIZER_CONFIRMATION_DUE_DAYS || "3", 10);
