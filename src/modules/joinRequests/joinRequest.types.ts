import { z } from "zod";

export const createJoinRequestSchema = z.object({
  body: z.object({
    travelPlanId: z.string().min(1),
    message: z.string().max(500).optional(),
  }),
});

export const updateJoinStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]),
  }),
});
