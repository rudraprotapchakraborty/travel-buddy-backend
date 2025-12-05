import { z } from "zod";

export const createIntentSchema = z.object({
  body: z.object({
    plan: z.enum(["MONTHLY", "YEARLY"]),
  }),
});
