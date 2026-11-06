import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { ReviewService } from "./review.service";
import { HttpException } from "../../core/http-exception";
import { assertObjectId } from "../../core/object-id";

export class ReviewController {
  static async addReview(req: AuthRequest, res: Response) {
    const { revieweeId, rating, comment, travelPlanId } = req.body;
    const reviewerId = req.user!.id;

    if (reviewerId === revieweeId) {
      throw new HttpException(400, "Cannot review yourself");
    }

    const review = await ReviewService.create(
      reviewerId,
      revieweeId,
      rating,
      comment,
      travelPlanId
    );
    res.status(201).json({ success: true, data: review });
  }

  static async updateReview(req: AuthRequest, res: Response) {
    const { rating, comment } = req.body;
    const user = req.user!;

    const updated = await ReviewService.update(
      user.id,
      assertObjectId(req.params.id, "review id"),
      rating,
      comment,
      user.role === "ADMIN"
    );

    if (updated === null) throw new HttpException(404, "Review not found");
    if (updated === false) {
      throw new HttpException(403, "You do not have permission to update this review");
    }
    res.json({ success: true, data: updated });
  }

  static async deleteReview(req: AuthRequest, res: Response) {
    const user = req.user!;
    const removed = await ReviewService.remove(
      user.id,
      assertObjectId(req.params.id, "review id"),
      user.role === "ADMIN"
    );

    if (removed === null) throw new HttpException(404, "Review not found");
    if (removed === false) {
      throw new HttpException(403, "You do not have permission to delete this review");
    }
    res.json({ success: true });
  }

  static async listReviews(req: AuthRequest, res: Response) {
    const { revieweeId, reviewerId, travelPlanId } = req.query;
    const filters: { revieweeId?: string; reviewerId?: string; travelPlanId?: string } = {};
    if (revieweeId) filters.revieweeId = assertObjectId(revieweeId, "revieweeId");
    if (reviewerId) filters.reviewerId = assertObjectId(reviewerId, "reviewerId");
    if (travelPlanId) filters.travelPlanId = assertObjectId(travelPlanId, "travelPlanId");

    const reviews = await ReviewService.list(filters);
    res.json({ success: true, data: reviews });
  }
}
