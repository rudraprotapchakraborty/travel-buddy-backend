import { Review } from "../../models/Review";
import { User } from "../../models/User";
import { Types } from "mongoose";

export class ReviewService {
  static async create(
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string,
    travelPlanId?: string
  ) {
    const review = await Review.create({
      reviewer: new Types.ObjectId(reviewerId),
      reviewee: new Types.ObjectId(revieweeId),
      rating,
      comment,
      travelPlan: travelPlanId ? new Types.ObjectId(travelPlanId) : undefined,
    });
    await this.recalculateRating(revieweeId);
    return review;
  }

  static async update(
    reviewerId: string,
    reviewId: string,
    rating?: number,
    comment?: string
  ) {
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

    await User.findByIdAndUpdate(userId, {
      avgRating: avg,
      reviewCount: count,
    });
  }
}
