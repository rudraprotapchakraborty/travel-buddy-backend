import { Types } from "mongoose";
import { Review } from "../../models/Review";
import { User } from "../../models/User";
import { HttpException } from "../../core/http-exception";

export class ReviewService {
  /** Create a review and recalculate the reviewee's rating. */
  static async create(
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string,
    travelPlanId?: string
  ) {
    if (!(await User.exists({ _id: revieweeId }))) {
      throw new HttpException(404, "User not found");
    }

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

  /**
   * Returns the updated review, `false` if the requester may not edit it, or
   * `null` if it does not exist. Admins may edit any review.
   */
  static async update(
    requesterId: string,
    reviewId: string,
    rating?: number,
    comment?: string,
    isAdmin = false
  ) {
    const review = await Review.findById(reviewId);
    if (!review) return null;
    if (review.reviewer.toString() !== requesterId && !isAdmin) return false;

    if (rating != null) review.rating = rating;
    if (comment != null) review.comment = comment;
    review.isEdited = true;
    await review.save();

    await this.recalculateRating(review.reviewee.toString());
    return review;
  }

  /**
   * Returns `true` if deleted, `false` if the requester may not delete it, or
   * `null` if it does not exist. Admins may delete any review.
   */
  static async remove(requesterId: string, reviewId: string, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) return null;
    if (review.reviewer.toString() !== requesterId && !isAdmin) return false;

    const revieweeId = review.reviewee.toString();
    await review.deleteOne();
    await this.recalculateRating(revieweeId);
    return true;
  }

  static async list(
    filters: { revieweeId?: string; reviewerId?: string; travelPlanId?: string } = {}
  ) {
    const query: Record<string, Types.ObjectId> = {};
    if (filters.revieweeId) query.reviewee = new Types.ObjectId(filters.revieweeId);
    if (filters.reviewerId) query.reviewer = new Types.ObjectId(filters.reviewerId);
    if (filters.travelPlanId) query.travelPlan = new Types.ObjectId(filters.travelPlanId);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({ path: "reviewer", select: "fullName profileImageUrl" });
    return reviews.filter((r) => r.reviewer);
  }

  /** Recalculate average rating and review count for a user. */
  static async recalculateRating(userId: string) {
    const agg = await Review.aggregate([
      { $match: { reviewee: new Types.ObjectId(userId) } },
      { $group: { _id: "$reviewee", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    await User.findByIdAndUpdate(userId, {
      avgRating: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0,
      reviewCount: agg[0]?.count || 0,
    });
  }
}
