import { Request, Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { PaymentService } from "./payment.service";

export class PaymentController {
  static async createIntent(req: AuthRequest, res: Response) {
    const { plan } = req.body;
    const data = await PaymentService.createPaymentIntent(req.user!.id, plan);
    res.json({ success: true, data });
  }

  // Simple webhook handler (no Stripe signature verification here)
  static async stripeWebhook(req: Request, res: Response) {
    const event = req.body as any;

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      await PaymentService.markPaymentSucceeded(intent.id);
    }

    res.json({ received: true });
  }
}
