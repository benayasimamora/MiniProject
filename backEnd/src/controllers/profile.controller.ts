import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";

export class ProfileController {
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.user_id;
      const full_name = req.body.full_name;
      const file = req.file;
      const updated = await ProfileService.updateProfile(
        user_id,
        full_name,
        file
      );
      res.json({ status: "success", data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.user_id;
      const { current_password, new_password } = req.body;
      await ProfileService.ChangePassword(
        user_id,
        current_password,
        new_password
      );
      res.json({ status: "success", message: "Password berhasil diubah" });
    } catch (error) {
      next(error);
    }
  }

  static async resetRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.resetRequest(req.body.email);
      res.json({ status: "success", message: "Link reset password dikirim" });
    } catch (error) {
      next(error);
    }
  }

  static async resetConfirm(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.resetConfirm(req.body.token, req.body.new_password);
      res.json({ status: "success", message: "Password berhasil direset" });
    } catch (error) {
      next(error);
    }
  }
}
