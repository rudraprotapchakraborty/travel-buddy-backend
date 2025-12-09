// src/modules/payments/payments.routes.ts
import express, { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../core/validate-request";
import { createIntentSchema } from "./payment.types";

const router: Router = Router();

/**
 * POST /api/payments/create-intent
 * Auth required, validated by createIntentSchema
 */
router.post(
  "/create-intent",
  authMiddleware,
  validateRequest(createIntentSchema),
  PaymentController.createIntent
);

/**
 * POST /api/payments/confirm
 * Auth required. Called by frontend after stripe.confirmCardPayment succeeds.
 * Server verifies the PaymentIntent with Stripe and records subscription.
 */
router.post("/confirm", authMiddleware, PaymentController.confirmPayment);

/**
 * POST /api/payments/webhook
 * Stripe sends events here. We attach express.raw middleware so the controller
 * can verify the Stripe signature using the exact raw request body.
 *
 * IMPORTANT:
 * - If you have global JSON body-parsing middleware mounted before this router
 *   (e.g. app.use(express.json())), that will consume the body and signature
 *   verification will fail. Either mount the webhook route before your global
 *   json parser or ensure you only use raw for this single path (as done here).
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  // now PaymentController.stripeWebhook expects raw body (see controller notes)
  PaymentController.stripeWebhook
);

export default router;
