import { z } from "zod";
import { objectIdSchema } from "../../core/object-id";

export const createJoinRequestSchema = z.object({
  body: z.object({
    travelPlanId: objectIdSchema,
    message: z.string().trim().max(500).optional(),
  }),
});

export const updateJoinStatusSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]),
  }),
});
