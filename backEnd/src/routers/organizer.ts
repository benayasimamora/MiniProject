import { Router, Request, Response, NextFunction } from "express"; // Tambahkan Request, Response, NextFunction
import { validate } from "../middlewares/validate";
import { authGuard, AuthRequestWithUser } from "../middlewares/authGuard"; // authGuard dan AuthRequestWithUser
import { roleGuard } from "../middlewares/roleGuard";
import { OrganizerController } from "../controllers/organizer.controller";
import { OrganizerApplySchema } from "../schema/organizer"; // Nama file: organizer.ts (bukan organizer.js)

const router = Router();

// POST /organizers/apply - Customer (yang belum jadi organizer) mengajukan diri
router.post(
  "/apply", // Path Anda sebelumnya "./apply", pastikan konsisten
  authGuard,
  roleGuard(["CUSTOMER"]), // Hanya CUSTOMER yang bisa apply
  validate(OrganizerApplySchema),
  (req: Request, res: Response, next: NextFunction) => OrganizerController.apply(req as AuthRequestWithUser, res, next) // Cast req
);

// GET /organizers/:organizerId/profile - Profil publik untuk seorang penyelenggara (Publik)
router.get(
  "/:organizerId/profile",
  OrganizerController.getPublicProfile
);

// Endpoint lain untuk organizer (misalnya, mengelola event mereka sendiri) bisa ditambahkan di sini
// dan diproteksi dengan authGuard dan roleGuard(['ORGANIZER'])

export default router;