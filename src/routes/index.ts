import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import travelPlanRoutes from "../modules/travelPlans/travelPlan.routes";
import reviewRoutes from "../modules/reviews/review.routes";
import joinRequestRoutes from "../modules/joinRequests/joinRequest.routes";
import paymentRoutes from "../modules/payments/payment.routes";
import adminRoutes from "../modules/admin/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/travel-plans", travelPlanRoutes);
router.use("/reviews", reviewRoutes);
router.use("/join-requests", joinRequestRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
