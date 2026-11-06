import { Schema, model, Document, Types } from "mongoose";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export interface IPayment extends Document {
  user: Types.ObjectId;
  amount: number;
  currency: string;
  plan?: "MONTHLY" | "YEARLY";
  stripePaymentIntentId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    plan: { type: String, enum: ["MONTHLY", "YEARLY"] },
    stripePaymentIntentId: { type: String, index: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
