import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";
import { User } from "../../models/User";
import { TravelPlan } from "../../models/TravelPlan";
import { Review } from "../../models/Review";
import { Payment } from "../../models/Payment";

const router = Router();

router.get(
  "/overview",
  authMiddleware,
  requireRole("ADMIN"),
  async (_req, res) => {
    const [userCount, planCount, reviewCount, paymentAgg] = await Promise.all([
      User.countDocuments(),
      TravelPlan.countDocuments(),
      Review.countDocuments(),
      Payment.aggregate([
        { $match: { status: "SUCCEEDED" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalRevenue = paymentAgg[0]?.total || 0;

    res.json({
      success: true,
      data: { userCount, planCount, reviewCount, totalRevenue },
    });
  }
);

export default router;
