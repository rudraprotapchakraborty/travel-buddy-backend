import { Request, Response } from "express";
import Stripe from "stripe";
import { AuthRequest } from "../../core/auth-middleware";
import { HttpException } from "../../core/http-exception";
import { PaymentService, stripe } from "./payment.service";
import { Payment } from "../../models/Payment";
import { env } from "../../config/env";

export class PaymentController {
  /** POST /payments/create-intent  Body: { plan: "MONTHLY" | "YEARLY" } */
  static async createIntent(req: AuthRequest, res: Response) {
    const data = await PaymentService.createPaymentIntent(
      req.user!.id,
      req.body.plan
    );
    res.json({ success: true, data });
  }

  /**
   * POST /payments/confirm  Body: { paymentIntentId }
   * Called after stripe.confirmCardPayment. The intent is re-checked with
   * Stripe and must belong to the signed-in user.
   */
  static async confirmPayment(req: AuthRequest, res: Response) {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
      user: req.user!.id,
    });
    if (!payment) throw new HttpException(404, "Payment not found");

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      throw new HttpException(400, `Payment not completed (status: ${pi.status})`);
    }
    if (pi.metadata?.userId !== req.user!.id) {
      throw new HttpException(403, "Payment does not belong to this user");
    }

    await PaymentService.markPaymentSucceeded(paymentIntentId);
    res.json({ success: true });
  }

  /**
   * POST /api/payments/webhook (mounted in app.ts with a raw body parser).
   * The signature is always verified when STRIPE_WEBHOOK_SECRET is set, and the
   * secret is mandatory in production.
   */
  static async stripeWebhook(req: Request, res: Response) {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      // Development only (env.ts refuses to start in production without it)
      res.status(400).send("Webhook secret not configured");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        (req.headers["stripe-signature"] as string) || "",
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err?.message ?? "Invalid signature"}`);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await PaymentService.markPaymentSucceeded(event.data.object.id);
          break;
        case "payment_intent.payment_failed":
          await PaymentService.markPaymentFailed(event.data.object.id);
          break;
        default:
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Error handling stripe event:", err);
      res.status(500).send();
    }
  }
}
