import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../core/validate-request";
import { createIntentSchema } from "./payment.types";

const router = Router();

router.post(
  "/create-intent",
  authMiddleware,
  validateRequest(createIntentSchema),
  PaymentController.createIntent
);

router.post("/webhook", PaymentController.stripeWebhook);

export default router;
