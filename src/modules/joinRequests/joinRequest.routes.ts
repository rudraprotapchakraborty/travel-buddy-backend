import { Router } from "express";
import { authMiddleware } from "../../core/auth-middleware";
import { JoinRequestController } from "./joinRequest.controller";
import { validateRequest } from "../../core/validate-request";
import {
  createJoinRequestSchema,
  updateJoinStatusSchema,
} from "./joinRequest.types";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createJoinRequestSchema),
  JoinRequestController.requestJoin
);

router.get("/me", authMiddleware, JoinRequestController.myRequests);
router.get("/host", authMiddleware, JoinRequestController.hostRequests);

router.patch(
  "/:id",
  authMiddleware,
  validateRequest(updateJoinStatusSchema),
  JoinRequestController.updateStatus
);

export default router;
