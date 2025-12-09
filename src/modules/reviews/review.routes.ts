import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { ReviewController } from "./review.controller";
import { validateRequest } from "../../core/validate-request";
import { createReviewSchema, updateReviewSchema } from "./review.types";

const router = Router();

/**
 * GET /api/reviews
 *
 * Public read access by default:
 * - Allows filtering by revieweeId, reviewerId, travelPlanId via query params.
 * - Returns an array (empty if no matches).
 *
 * If you prefer to require authentication for reading reviews, uncomment `authMiddleware`
 * below so only authenticated users can list reviews.
 */
router.get("/", /* authMiddleware, */ ReviewController.listReviews);

// Protected write operations — require authentication
router.post(
  "/",
  authMiddleware,
  validateRequest(createReviewSchema),
  ReviewController.addReview
);

// Update: only the owner or an admin may update a review.
// authMiddleware ensures req.user is populated; controller handles isAdmin check.
router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

// Delete: only the owner or an admin may delete a review.
// authMiddleware ensures req.user is populated; controller handles isAdmin check.
router.delete("/:id", authMiddleware, ReviewController.deleteReview);

export default router;
