import Stripe from "stripe";
import { env } from "../../config/env";
import { Payment } from "../../models/Payment";
import { User } from "../../models/User";
import { Types } from "mongoose";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

export class PaymentService {
  static async createPaymentIntent(userId: string, plan: "MONTHLY" | "YEARLY") {
    const amount = plan === "MONTHLY" ? 1000 : 10000;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId,
        plan,
      },
    });

    const payment = await Payment.create({
      user: new Types.ObjectId(userId),
      amount,
      currency: "usd",
      stripePaymentIntentId: paymentIntent.id,
      status: "PENDING",
    });

    return { clientSecret: paymentIntent.client_secret, payment };
  }

  static async markPaymentSucceeded(intentId: string) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: intentId,
    });
    if (!payment) return;

    payment.status = "SUCCEEDED";
    await payment.save();

    const plan = payment.amount === 1000 ? "MONTHLY" : "YEARLY";
    const endAt = new Date();
    if (plan === "MONTHLY") endAt.setMonth(endAt.getMonth() + 1);
    else endAt.setMonth(endAt.getMonth() + 12);

    await User.findByIdAndUpdate(payment.user, {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: plan,
      subscriptionEndAt: endAt,
      isVerified: true,
    });
  }
}
