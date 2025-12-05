import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { ReviewService } from "./review.service";
import { HttpException } from "../../core/http-exception";

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
    const updated = await ReviewService.update(
      req.user!.id,
      req.params.id,
      rating,
      comment
    );
    if (!updated) throw new HttpException(404, "Review not found");
    res.json({ success: true, data: updated });
  }

  static async deleteReview(req: AuthRequest, res: Response) {
    const removed = await ReviewService.remove(req.user!.id, req.params.id);
    if (!removed) throw new HttpException(404, "Review not found");
    res.json({ success: true });
  }
}
