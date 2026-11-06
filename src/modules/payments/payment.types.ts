import { z } from "zod";

export const createIntentSchema = z.object({
  body: z.object({
    plan: z.enum(["MONTHLY", "YEARLY"]),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().regex(/^pi_[A-Za-z0-9_]+$/),
  }),
});
