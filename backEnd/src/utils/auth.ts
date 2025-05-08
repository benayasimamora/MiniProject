import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

const SALT_ROUNDS = 10;
const JWT_SECRET = SECRET_KEY || " ";

// hash password
export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, SALT_ROUNDS);
}

// compare password
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

// generate JWT
export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// verify JWT
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
