import { Schema, model, Document, Types } from "mongoose";

export type TravelType = "SOLO" | "FAMILY" | "FRIENDS";
export type TravelPlanStatus = "PLANNED" | "COMPLETED" | "CANCELLED";

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
      enum: ["SOLO", "FAMILY", "FRIENDS"],
      required: true,
    },
    description: String,
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PLANNED", "COMPLETED", "CANCELLED"],
      default: "PLANNED",
    },
  },
  { timestamps: true }
);

export const TravelPlan = model<ITravelPlan>("TravelPlan", travelPlanSchema);
