import { Router } from "express";
import { DashboardController } from "../controllers/dashboard-controller";
import { validate } from "../middlewares/validate";
import {
  EventUpdateSchema,
  StartsQuerySchema,
  TransctionActionSchema,
} from "../schema/dashboard";
import { authGuard } from "../middlewares/authGuard";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// semua route hanya untuk organizer yang sudah login
router.use(authGuard, roleGuard(["ORGANIZER"]));

// list event
router.get("/events", DashboardController.listEvents);

// update event
router.put(
  "/events/:eventId",
  validate(EventUpdateSchema),
  DashboardController.updateEvent
);

// hapus event
router.delete("/events/:eventId", DashboardController.deleteEvent);

// list transaksi
router.get("/transactions", DashboardController.listTransactions);

// accept transaksi
router.patch(
  "/transactions/:txId/accept",
  DashboardController.acceptTransaction
);

// reject transaksi
router.patch(
  "/transactions/:txId/reject",
  validate(TransctionActionSchema),
  DashboardController.rejectTransaction
);

// statistik
router.get("/stats", validate(StartsQuerySchema), DashboardController.getStats);

// list kehadiran
router.get("/event/:eventId/attendances", DashboardController.listAttendees);

export default router;
