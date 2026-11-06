import { z } from "zod";
import { objectIdSchema } from "../../core/object-id";

export const createReviewSchema = z.object({
  body: z.object({
    revieweeId: objectIdSchema,
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
    travelPlanId: objectIdSchema.optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(1000).optional(),
  }),
});
