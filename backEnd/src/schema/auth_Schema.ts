import { log } from "console";
import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Formal email Invalid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  referralCode: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type LoginInput = z.infer<typeof loginSchema>;
