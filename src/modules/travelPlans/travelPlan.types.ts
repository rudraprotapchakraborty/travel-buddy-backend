import { z } from "zod";
import { objectIdSchema } from "../../core/object-id";

const date = z
  .string()
  .min(1)
  .transform((v, ctx) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return d;
  });

const budget = z.number().nonnegative().max(10_000_000);

export const createPlanSchema = z.object({
  body: z
    .object({
      destination: z.string().trim().min(2).max(120),
      startDate: date,
      endDate: date,
      budgetMin: budget.optional(),
      budgetMax: budget.optional(),
      travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]),
      description: z.string().trim().max(1000).optional(),
      isPublic: z.boolean().optional(),
    })
    .refine((b) => b.endDate >= b.startDate, {
      message: "End date must be after the start date",
      path: ["endDate"],
    })
    .refine(
      (b) => b.budgetMin == null || b.budgetMax == null || b.budgetMin <= b.budgetMax,
      { message: "Minimum budget cannot exceed maximum", path: ["budgetMin"] }
    ),
});

export const updatePlanSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    destination: z.string().trim().min(2).max(120).optional(),
    startDate: date.optional(),
    endDate: date.optional(),
    budgetMin: budget.optional(),
    budgetMax: budget.optional(),
    travelType: z.enum(["SOLO", "FAMILY", "FRIENDS"]).optional(),
    description: z.string().trim().max(1000).optional(),
    isPublic: z.boolean().optional(),
    status: z.enum(["PLANNED", "COMPLETED", "CANCELLED"]).optional(),
  }),
});

export const planIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });

export const adminStatusSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    status: z
      .string()
      .transform((s) => s.toUpperCase())
      .pipe(z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED", "FLAGGED"])),
  }),
});
