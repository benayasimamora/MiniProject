import { z } from "zod";

export const OrganizerApplySchema = z.object({
  organization_name: z.string().min(3),
  organization_email: z.string().email(),
  phone_number: z.string().min(6),
  website_url: z.string().optional(),
  address: z.string().min(5),
});
