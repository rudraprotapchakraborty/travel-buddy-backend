import { Router } from "express";
import { User } from "../../models/User";
import { TravelPlan } from "../../models/TravelPlan";
import { Review } from "../../models/Review";

const router = Router();

/**
 * GET /api/public/stats
 * Aggregate counts only (no personal data) for the landing page.
 */
router.get("/stats", async (_req, res) => {
  const [members, trips, reviews] = await Promise.all([
    User.countDocuments({ emailVerified: true, isBlocked: false }),
    TravelPlan.countDocuments({ isPublic: true, status: { $in: ["PLANNED", "ACTIVE"] } }),
    Review.countDocuments(),
  ]);

  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json({ success: true, data: { members, trips, reviews } });
});

export default router;
