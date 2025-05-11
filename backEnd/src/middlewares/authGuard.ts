import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwt } from "../interface/auth";
import prisma from "../lib/prisma";
import { SECRET_KEY } from "../config"; // Pastikan SECRET_KEY diekspor dari config

export interface AuthRequestWithUser extends Request {
    user: IJwt; // Membuat req.user non-opsional setelah guard ini
}

export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      throw { status: 401, message: "Token missing" };
    const token = header.replace("Bearer ", "");
    if (!SECRET_KEY) {
        console.error("SECRET_KEY is not defined in config!");
        throw { status: 500, message: "Server configuration error" };
    }
    const payload = jwt.verify(token, SECRET_KEY) as IJwt;
    // lampirkan user ke Request
    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
    });
    if (!user) throw { status: 401, message: "User not found" };
    (req as AuthRequestWithUser).user = payload; // Cast untuk menetapkan req.user
    next();
  } catch (error) {
    next(error);
  }
}