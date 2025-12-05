import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  travelPlan?: Types.ObjectId;
  rating: number;
  comment?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    travelPlan: { type: Schema.Types.ObjectId, ref: "TravelPlan" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Review = model<IReview>("Review", reviewSchema);
