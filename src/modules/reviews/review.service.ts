import { Review } from "../../models/Review";
import { Types } from "mongoose";
import { HttpException } from "../../core/http-exception";

export class ReviewService {
  static async create(reviewerId: string, revieweeId: string, rating: number, comment?: string, travelPlanId?: string) {
    const review = await Review.create({
      reviewer: new Types.ObjectId(reviewerId),
      reviewee: new Types.ObjectId(revieweeId),
      rating,
      comment,
      travelPlan: travelPlanId ? new Types.ObjectId(travelPlanId) : undefined,
    });
    // recalc avg rating, reviewCount etc. (your existing function)
    await this.recalculateRating(revieweeId);
    return review;
  }

  static async update(reviewerId: string, reviewId: string, rating?: number, comment?: string) {
    const review = await Review.findById(reviewId);
    if (!review || review.reviewer.toString() !== reviewerId) return null;

    if (rating != null) review.rating = rating;
    if (comment != null) review.comment = comment;
    review.isEdited = true;
    await review.save();

    await this.recalculateRating(review.reviewee.toString());
    return review;
  }

  static async remove(reviewerId: string, reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review || review.reviewer.toString() !== reviewerId) return null;

    const revieweeId = review.reviewee.toString();
    await review.deleteOne();
    await this.recalculateRating(revieweeId);
    return true;
  }

  // NEW: list / query reviews
  static async list(filters: { revieweeId?: string; reviewerId?: string; travelPlanId?: string } = {}) {
    const query: any = {};

    if (filters.revieweeId) query.reviewee = new Types.ObjectId(filters.revieweeId);
    if (filters.reviewerId) query.reviewer = new Types.ObjectId(filters.reviewerId);
    if (filters.travelPlanId) query.travelPlan = new Types.ObjectId(filters.travelPlanId);

    // Sort newest first
    return Review.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "reviewer", select: "fullName profileImageUrl" });
  }

  private static async recalculateRating(userId: string) {
    const agg = await Review.aggregate([
      { $match: { reviewee: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$reviewee",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avg = agg[0]?.avg || 0;
    const count = agg[0]?.count || 0;

    // update on User model (make sure User has these fields)
    const { User } = require("../../models/User");
    await User.findByIdAndUpdate(userId, {
      avgRating: avg,
      reviewCount: count,
    });
  }
}
