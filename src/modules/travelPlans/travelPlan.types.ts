import { z } from "zod";

export const createPlanSchema = z.object({
  body: z.object({
    destination: z.string().min(2),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]),
    description: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    destination: z.string().min(2).optional(),
    startDate: z.string().min(1).optional(),
    endDate: z.string().min(1).optional(),
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]).optional(),
    description: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
    status: z.enum(["PLANNED", "COMPLETED", "CANCELLED"]).optional(),
  }),
});
