import { Schema, model, Document, Types } from "mongoose";

export type TravelType = "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS";
export type TravelPlanStatus =
  | "PLANNED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "FLAGGED";

export interface ITravelPlan extends Document {
  user: Types.ObjectId;
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetMin?: number;
  budgetMax?: number;
  travelType: TravelType;
  description?: string;
  isPublic: boolean;
  status: TravelPlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const travelPlanSchema = new Schema<ITravelPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budgetMin: Number,
    budgetMax: Number,
    travelType: {
      type: String,
      enum: ["SOLO", "COUPLE", "FAMILY", "FRIENDS"],
      required: true,
    },
    description: String,
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED", "FLAGGED"],
      default: "PLANNED",
    },
  },
  { timestamps: true }
);

travelPlanSchema.index({ user: 1, startDate: 1 });
travelPlanSchema.index({ isPublic: 1, status: 1, destination: 1 });

export const TravelPlan = model<ITravelPlan>("TravelPlan", travelPlanSchema);
