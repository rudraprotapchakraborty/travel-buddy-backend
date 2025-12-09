import { Review } from "../../models/Review";
import { Types } from "mongoose";

export class ReviewService {
  /**
   * Create a new review and recalculate the reviewee's rating.
   */
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

    // recalc avg rating, reviewCount etc.
    await this.recalculateRating(revieweeId);
    return review;
  }

  /**
   * Update a review.
   *
   * Return values:
   * - the updated review on success
   * - `false` if the review was found but the requester is not allowed (forbidden)
   * - `null` if the review was not found
   *
   * `isAdmin` allows admins to update any review.
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

    // allow update if owner OR admin
    if (review.reviewer.toString() !== requesterId && !isAdmin) {
      return false;
    }

    if (rating != null) review.rating = rating;
    if (comment != null) review.comment = comment;
    review.isEdited = true;
    await review.save();

    await this.recalculateRating(review.reviewee.toString());
    return review;
  }

  /**
   * Remove a review.
   *
   * Return values:
   * - `true` if deleted
   * - `false` if found but requester is not allowed (forbidden)
   * - `null` if not found
   *
   * `isAdmin` allows admins to delete any review.
   */
  static async remove(requesterId: string, reviewId: string, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) return null;

    // allow delete if owner OR admin
    if (review.reviewer.toString() !== requesterId && !isAdmin) {
      return false;
    }

    const revieweeId = review.reviewee.toString();
    await review.deleteOne();
    await this.recalculateRating(revieweeId);
    return true;
  }

  /**
   * List reviews with optional filters.
   * Filters: { revieweeId?, reviewerId?, travelPlanId? }
   *
   * Returns an array (may be empty). Reviewer is populated with basic info.
   */
  static async list(
    filters: { revieweeId?: string; reviewerId?: string; travelPlanId?: string } = {}
  ) {
    const query: any = {};

    if (filters.revieweeId) query.reviewee = new Types.ObjectId(filters.revieweeId);
    if (filters.reviewerId) query.reviewer = new Types.ObjectId(filters.reviewerId);
    if (filters.travelPlanId) query.travelPlan = new Types.ObjectId(filters.travelPlanId);

    // Sort newest first and populate reviewer summary
    return Review.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "reviewer", select: "fullName profileImageUrl" });
  }

  /**
   * Recalculate average rating & review count for a user and persist on User model.
   */
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
