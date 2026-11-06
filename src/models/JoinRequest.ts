import { Schema, model, Document, Types } from "mongoose";

export type JoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface IJoinRequest extends Document {
  travelPlan: Types.ObjectId;
  requester: Types.ObjectId;
  host: Types.ObjectId;
  status: JoinRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    travelPlan: { type: Schema.Types.ObjectId, ref: "TravelPlan", required: true },
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    message: String,
  },
  { timestamps: true }
);

joinRequestSchema.index({ host: 1, createdAt: -1 });
joinRequestSchema.index({ requester: 1, createdAt: -1 });

export const JoinRequest = model<IJoinRequest>("JoinRequest", joinRequestSchema);
