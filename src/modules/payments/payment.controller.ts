// src/modules/payments/payment.controller.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import { AuthRequest } from "../../core/auth-middleware";
import { PaymentService } from "./payment.service";
import { env } from "../../config/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

export class PaymentController {
  /**
   * POST /payments/create-intent
   * Body: { plan: "MONTHLY" | "YEARLY" }
   * Auth required (AuthRequest provides req.user)
   */
  static async createIntent(req: AuthRequest, res: Response) {
    try {
      const { plan } = req.body;
      const data = await PaymentService.createPaymentIntent(req.user!.id, plan);
      return res.json({ success: true, data });
    } catch (err) {
      console.error("createIntent error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /payments/confirm
   * Body: { paymentIntentId: string }
   * Auth required. This endpoint is called by the frontend *after* stripe.confirmCardPayment
   * to immediately mark the payment succeeded on your DB (server double-checks with Stripe).
   */
  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ success: false, message: "paymentIntentId required" });
      }

      // Retrieve PI from Stripe to verify it actually succeeded
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!pi) {
        return res.status(404).json({ success: false, message: "PaymentIntent not found" });
      }

      if (pi.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: `Payment not completed (status: ${pi.status})`,
        });
      }

      // Security: if you set metadata.userId when creating the PI, ensure it matches the authenticated user
      const metadataUserId = (pi.metadata && pi.metadata.userId) || null;
      if (metadataUserId && req.user && metadataUserId !== String(req.user.id)) {
        console.warn(
          `confirmPayment: metadata userId mismatch: pi.metadata.userId=${metadataUserId}, req.user.id=${req.user!.id}`
        );
        return res.status(403).json({ success: false, message: "Payment does not belong to this user" });
      }

      // Idempotent update via existing service
      await PaymentService.markPaymentSucceeded(paymentIntentId);

      return res.json({ success: true });
    } catch (err) {
      console.error("confirmPayment error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /payments/webhook
   * NOTE: Stripe requires the raw request body in order to verify signatures.
   * When mounting this route you must ensure the middleware for this path uses bodyParser.raw({ type: "application/json" })
   * Example (app.ts / server bootstrap):
   *   app.post("/api/payments/webhook", bodyParser.raw({ type: "application/json" }), paymentRouter);
   *
   * If STRIPE_WEBHOOK_SECRET is set we will verify the signature. If not set, we fall back to permissive behavior
   * (useful for local dev but not recommended for production).
   */
  static async stripeWebhook(req: Request, res: Response) {
    const rawBody = (req as any).rawBody ?? req.body; // rawBody if you store it earlier, else req.body
    const sig = (req.headers["stripe-signature"] as string) || "";

    // If you have a webhook secret, verify signature. If not, log a warning and continue (dev fallback).
    if (env.STRIPE_WEBHOOK_SECRET) {
      try {
        const event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
        // handle event
        await PaymentController.handleStripeEvent(event);
        return res.json({ received: true });
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err && err.message ? err.message : err);
        return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : "Invalid signature"}`);
      }
    } else {
      // Fallback: parse permissively (useful for local development where you may not forward raw body)
      try {
        const event = req.body as any;
        console.warn("STRIPE_WEBHOOK_SECRET not set — processing webhook without signature verification (DEV ONLY)");
        await PaymentController.handleStripeEvent(event);
        return res.json({ received: true });
      } catch (err) {
        console.error("Error processing webhook (no signature):", err);
        return res.status(500).send();
      }
    }
  }

  // Internal helper for handling Stripe events
  private static async handleStripeEvent(event: any) {
    const type = event.type;
    try {
      switch (type) {
        case "payment_intent.succeeded": {
          const intent = event.data.object;
          await PaymentService.markPaymentSucceeded(intent.id);
          break;
        }
        case "invoice.payment_succeeded": {
          // If you use Stripe Subscriptions, you might want to handle invoice events
          const invoice = event.data.object;
          // invoice.payment_intent might exist
          if (invoice.payment_intent) {
            await PaymentService.markPaymentSucceeded(invoice.payment_intent);
          }
          break;
        }
        case "checkout.session.completed": {
          // If you ever use Checkout Sessions, handle it here
          const session = event.data.object;
          // If you stored payment_intent or metadata, handle accordingly
          if (session.payment_intent) {
            await PaymentService.markPaymentSucceeded(session.payment_intent);
          }
          break;
        }
        default:
          console.log(`Unhandled stripe event type: ${type}`);
      }
    } catch (err) {
      console.error("Error handling stripe event:", err);
      throw err;
    }
  }
}
