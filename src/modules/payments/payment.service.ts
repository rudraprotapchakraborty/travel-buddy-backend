import Stripe from "stripe";
import { Types } from "mongoose";
import { env } from "../../config/env";
import { Payment } from "../../models/Payment";
import { User } from "../../models/User";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// Prices live on the server only; the client just picks a plan.
const PLANS = {
  MONTHLY: { amount: 1000, months: 1 },
  YEARLY: { amount: 10000, months: 12 },
} as const;

export type PlanName = keyof typeof PLANS;

export class PaymentService {
  static async createPaymentIntent(userId: string, plan: PlanName) {
    const { amount } = PLANS[plan];

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId, plan },
    });

    const payment = await Payment.create({
      user: new Types.ObjectId(userId),
      amount,
      currency: "usd",
      plan,
      stripePaymentIntentId: paymentIntent.id,
      status: "PENDING",
    });

    return { clientSecret: paymentIntent.client_secret, payment };
  }

  /**
   * Idempotent: the PENDING -> SUCCEEDED transition happens atomically, so the
   * confirm endpoint and the webhook can both call this without granting the
   * subscription twice.
   */
  static async markPaymentSucceeded(intentId: string) {
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intentId, status: { $ne: "SUCCEEDED" } },
      { status: "SUCCEEDED" },
      { new: true }
    );
    if (!payment) return;

    const plan: PlanName = payment.plan === "YEARLY" ? "YEARLY" : "MONTHLY";
    const endAt = new Date();
    endAt.setMonth(endAt.getMonth() + PLANS[plan].months);

    await User.findByIdAndUpdate(payment.user, {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: plan,
      subscriptionEndAt: endAt,
      isVerified: true,
    });
  }

  static async markPaymentFailed(intentId: string) {
    await Payment.updateOne(
      { stripePaymentIntentId: intentId, status: "PENDING" },
      { status: "FAILED" }
    );
  }
}
