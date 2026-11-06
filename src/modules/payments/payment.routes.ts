import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../core/validate-request";
import { confirmPaymentSchema, createIntentSchema } from "./payment.types";

const router = Router();

// The Stripe webhook is mounted in app.ts (it needs the raw body).
router.post(
  "/create-intent",
  authMiddleware,
  validateRequest(createIntentSchema),
  PaymentController.createIntent
);

router.post(
  "/confirm",
  authMiddleware,
  validateRequest(confirmPaymentSchema),
  PaymentController.confirmPayment
);

export default router;
