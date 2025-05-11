import { Request, Response, NextFunction } from "express";
import { OrganizerProfileService } from "../services/organizeProfile-service";

export class OrganizerProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const profile = await OrganizerProfileService.getOrganizerProfile(userId);
      res.json({ status: "success", data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const data = req.body;
      const updated = await OrganizerProfileService.updateOrganizerProfile(
        userId,
        data
      );
      res.json({ status: "success", data: updated });
    } catch (error) {
      next(error);
    }
  }
}
