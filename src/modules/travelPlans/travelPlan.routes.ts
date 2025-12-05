import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";
import { TravelPlanController } from "./travelPlan.controller";
import { validateRequest } from "../../core/validate-request";
import {
  createPlanSchema,
  updatePlanSchema,
} from "./travelPlan.types";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createPlanSchema),
  TravelPlanController.create
);

router.get("/me", authMiddleware, TravelPlanController.listMine);
router.get("/match", authMiddleware, TravelPlanController.match);
router.get("/:id", authMiddleware, TravelPlanController.getById);

router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updatePlanSchema),
  TravelPlanController.update
);

router.delete("/:id", authMiddleware, TravelPlanController.remove);

router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  TravelPlanController.listAllForAdmin
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  TravelPlanController.updateStatusAdmin
);

export default router;
