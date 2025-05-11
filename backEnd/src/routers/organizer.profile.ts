import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { validate } from "../middlewares/validate";
import { OrganizerProfileController } from "../controllers/organizer-profile.controller";
import { OrganizerProfileUpdateSchema } from "../schema/organizerProfile";

const router = Router();
// hanya organizer yang bisa akses
router.use(authGuard, roleGuard(["ORGANIZER"]));

router.get("/profile", OrganizerProfileController.getProfile);

router.put(
  "/profile",
  validate(OrganizerProfileUpdateSchema),
  OrganizerProfileController.updateProfile
);

export default router;
