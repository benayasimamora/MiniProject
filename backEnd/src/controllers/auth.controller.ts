import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schema/auth_Schema";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const { user, token } = await AuthService.register(input);
      res.status(201).json({ accessToken: token, user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(input);
      res.json({ accessToken: token, user });
    } catch (error) {
      next(error);
    }
  }
}
