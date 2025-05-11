import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  static async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const events = await DashboardService.listEvents(userId);
      res.json({ status: "success", data: events });
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const data = req.body;
      const updated = await DashboardService.updateEvent(Number(eventId), data);
      res.json({ status: "success", data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      await DashboardService.deleteEvent(Number(eventId));
      res.json({ status: "success", message: "Event dihapus" });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.user_id;
      const period = req.query.period as "year" | "month" | "day";
      const stats = await DashboardService.getStats(user_id, period);
      res.json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async acceptTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const txId = Number(req.params.txId);
      const result = await DashboardService.ChangeTransactionStatus(
        txId,
        "CONFIRMED"
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async listTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user_id = req.user!.user_id;
      const txs = await DashboardService.listTransactions(user_id);
      res.json({ status: "success", data: txs });
    } catch (error) {
      next(error);
    }
  }

  static async rejectTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const txId = Number(req.params.txId);
      const { reason } = req.body;
      const result = await DashboardService.ChangeTransactionStatus(
        txId,
        "REJECTED",
        reason
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async listAttendees(req: Request, res: Response, next: NextFunction) {
    try {
      const event_id = Number(req.params.event_Id);
      const list = await DashboardService.listAttendees(event_id);
      res.json({ status: "Success", data: list });
    } catch (error) {
      next(error);
    }
  }
}
