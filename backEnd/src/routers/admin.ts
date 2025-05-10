import { Router } from "express";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";
import { OrganizerController } from "../controllers/organizer.controller";

const router = Router();
router.use(authGuard, roleGuard(["ORGANIZER"]));

// approve
router.patch("/organizer/:user_id/approve", OrganizerController.approve);
// reject
router.patch("/organizer/:user_id/reject", OrganizerController.reject);

export default router;
