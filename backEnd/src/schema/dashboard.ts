import { z } from "zod";

// create/update event
export const EventUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  paid: z.boolean().optional(),
  price: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_seats: z.number().optional(),
});

// query schema
export const StartsQuerySchema = z.object({
  period: z.enum(["year", "month", "day"]),
});

// transaction schema
export const TransctionActionSchema = z.object({
  reason: z.string().min(5),
});
