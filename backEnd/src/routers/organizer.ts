import { Router } from "express";
import { validate } from "../middlewares/validate";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { OrganizerController } from "../controllers/organizer.controller";
import { OrganizerApplySchema } from "../schema/organizer";

const router = Router();

// hanya customer yang bisa apply
router.post(
  "./apply",
  authGuard,
  roleGuard(["CUSTOMER"]),
  validate(OrganizerApplySchema),
  OrganizerController.apply
);

export default router;
