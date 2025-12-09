import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";
import { HttpException } from "../../core/http-exception";

export class ReviewController {
  static async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { revieweeId, rating, comment, travelPlanId } = req.body;
      const reviewerId = (req as any).user!.id;

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
    } catch (err) {
      next(err);
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { rating, comment } = req.body;
      const user = (req as any).user!;
      const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";

      // Expect ReviewService.update to accept (requesterId, reviewId, rating, comment, isAdmin)
      // and to return:
      // - the updated review on success,
      // - false if found but not allowed (forbidden),
      // - null if not found.
      const updated = await ReviewService.update(
        user.id,
        req.params.id,
        rating,
        comment,
        isAdmin
      );

      if (updated === null) {
        throw new HttpException(404, "Review not found");
      }

      if (updated === false) {
        throw new HttpException(403, "Forbidden: you do not have permission to update this review");
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user!;
      const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";

      // Expect ReviewService.remove to accept (requesterId, reviewId, isAdmin)
      // and to return:
      // - true if deleted,
      // - false if found but forbidden,
      // - null if not found.
      const removed = await ReviewService.remove(user.id, req.params.id, isAdmin);

      if (removed === null) {
        throw new HttpException(404, "Review not found");
      }

      if (removed === false) {
        throw new HttpException(403, "Forbidden: you do not have permission to delete this review");
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // NEW: list reviews based on query params
  static async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { revieweeId, reviewerId, travelPlanId } = req.query;
      const filters: any = {};
      if (revieweeId) filters.revieweeId = String(revieweeId);
      if (reviewerId) filters.reviewerId = String(reviewerId);
      if (travelPlanId) filters.travelPlanId = String(travelPlanId);

      const reviews = await ReviewService.list(filters);
      // always return 200 with array (empty if no reviews)
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }
}
