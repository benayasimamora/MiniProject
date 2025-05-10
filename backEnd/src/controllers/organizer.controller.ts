import e, { Request, Response, NextFunction } from "express";
import { OrganizerService } from "../services/organizer.service";
import { OrganizerEmail } from "../services/organizer-email.service";
import { Organizer_Status } from "@prisma/client";

export class OrganizerController {
  static async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const data = req.body;
      const application = await OrganizerService.apply(userId, data);
      res.status(201).json({ status: "success", data: application });
    } catch (error) {
      next(error);
    }
  }

  static async approve(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user_id = Number(req.params.user_id);
      // update status di database
      const updatedApp = await OrganizerService.transition(
        user_id,
        Organizer_Status.APPROVED
      );
      // kirim email disetujui
      const user = await OrganizerService.getUser(user_id);
      if (user)
        await OrganizerEmail.notifyResult(
          user.email,
          Organizer_Status.APPROVED
        );
      // respon ke client
      res.json({ status: "success", data: updatedApp });
    } catch (error) {
      next(error);
    }
  }

  static async reject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user_id = Number(req.params.user_id);
      const { reason } = req.body;
      // update status jadi reject
      const updatedApp = await OrganizerService.transition(
        user_id,
        Organizer_Status.REJECTED,
        reason
      );
      // kirim email notifikasi
      const user = await OrganizerService.getUser(user_id);
      if (user)
        await OrganizerEmail.notifyResult(
          user.email,
          Organizer_Status.REJECTED,
          reason
        );
      // respon ke client
      res.json({ status: "success", data: updatedApp });
    } catch (error) {
      next(error);
    }
  }
}
