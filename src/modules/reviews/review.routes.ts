import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { ReviewController } from "./review.controller";
import { validateRequest } from "../../core/validate-request";
import { createReviewSchema, updateReviewSchema } from "./review.types";

const router = Router();

// Public read: you can allow reading without auth if you prefer
// If you want only authenticated users to read, use authMiddleware here
router.get("/", /* authMiddleware, */ ReviewController.listReviews);

// protected write operations
router.post("/", authMiddleware, validateRequest(createReviewSchema), ReviewController.addReview);
router.patch("/:id", authMiddleware, validateRequest(updateReviewSchema), ReviewController.updateReview);
router.delete("/:id", authMiddleware, ReviewController.deleteReview);

export default router;
