import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";
import { TravelPlanController } from "./travelPlan.controller";
import { validateRequest } from "../../core/validate-request";
import {
  adminStatusSchema,
  createPlanSchema,
  planIdSchema,
  updatePlanSchema,
} from "./travelPlan.types";

const router = Router();

router.use(authMiddleware);

// Owner routes
router.post("/", validateRequest(createPlanSchema), TravelPlanController.create);
router.get("/me", TravelPlanController.listMine);
router.get("/match", TravelPlanController.match);

// Admin routes (declared before "/:id" routes that share a prefix)
router.get("/admin/all", requireRole("ADMIN"), TravelPlanController.listAllForAdmin);
router.patch(
  "/admin/:id/status",
  requireRole("ADMIN"),
  validateRequest(adminStatusSchema),
  TravelPlanController.updateStatusAdmin
);
router.delete(
  "/admin/:id",
  requireRole("ADMIN"),
  validateRequest(planIdSchema),
  TravelPlanController.adminDelete
);

router.get("/:id", validateRequest(planIdSchema), TravelPlanController.getById);
router.patch("/:id", validateRequest(updatePlanSchema), TravelPlanController.update);
router.delete("/:id", validateRequest(planIdSchema), TravelPlanController.remove);

export default router;
