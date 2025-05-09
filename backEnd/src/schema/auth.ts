import { z } from "zod";

export const RegisterSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
