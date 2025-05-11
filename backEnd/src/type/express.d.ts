import { IJwt } from "../interface/auth";

declare global {
  namespace Express {
    interface Request {
      user?: IJwt; // Menggunakan IJwt agar konsisten dengan authGuard
    }
  }
}