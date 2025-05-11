import { z } from "zod";

export const OrganizerApplySchema = z.object({
  organization_name: z.string().min(3, { message: "Nama organisasi minimal 3 karakter" }),
  organization_email: z.string().email({ message: "Format email organisasi tidak valid" }),
  phone_number: z.string().min(6, { message: "Nomor telepon minimal 6 digit" }),
  website_url: z.string().url({ message: "Format URL website tidak valid" }).optional().or(z.literal('')), // Boleh URL atau string kosong
  address: z.string().min(5, { message: "Alamat minimal 5 karakter" }),
});