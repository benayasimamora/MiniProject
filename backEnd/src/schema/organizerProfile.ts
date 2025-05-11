import { z } from "zod";

export const OrganizerProfileUpdateSchema = z.object({
  organization_name: z.string().min(3),
  phone_number: z.string().min(6),
  address: z.string().min(5),
  website_url: z.string().url().optional(),
});
