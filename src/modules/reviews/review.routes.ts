import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { ReviewController } from "./review.controller";
import { validateRequest } from "../../core/validate-request";
import {
  createReviewSchema,
  updateReviewSchema,
} from "./review.types";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createReviewSchema),
  ReviewController.addReview
);

router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

router.delete("/:id", authMiddleware, ReviewController.deleteReview);

export default router;
