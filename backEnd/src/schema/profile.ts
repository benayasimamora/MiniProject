import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(3),
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordConfirmSchema = z.object({
  token: z.string(),
  new_password: z.string().min(6),
});
