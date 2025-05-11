import { Request, Response, NextFunction, RequestHandler } from "express";
import { IJwt } from "../interface/auth"; // Pastikan IJwt adalah tipe payload user Anda

// Definisikan tipe Request yang memiliki properti user dari IJwt
interface RequestWithUserRole extends Request {
    user?: IJwt; // user bisa undefined sebelum auth middleware, tapi akan ada setelahnya
}

export const roleGuard = (
  allowedRoles: ("CUSTOMER" | "ORGANIZER")[]
): RequestHandler => { // Pastikan mengembalikan RequestHandler
  return (req: RequestWithUserRole, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      // Kirim respons error dan hentikan eksekusi
      res.status(403).json({
        status: "error",
        message: "Forbidden: insufficient role",
      });
      return; // Penting untuk menghentikan eksekusi lebih lanjut
    }
    // Jika role valid, lanjutkan ke handler berikutnya
    next();
  };
};