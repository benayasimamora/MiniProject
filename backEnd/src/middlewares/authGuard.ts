import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwt } from "../interface/auth";
import prisma from "../lib/prisma";
import { SECRET_KEY } from "../config";

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
    const payload = jwt.verify(token, SECRET_KEY!) as IJwt;
    // lampirkan user ke Request
    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
    });
    if (!user) throw { status: 401, message: "User not found" };
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
