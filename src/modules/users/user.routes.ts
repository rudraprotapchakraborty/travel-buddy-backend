import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";

const router = Router();

router.get("/:id", authMiddleware, UserController.getProfile);
router.get("/me/self", authMiddleware, UserController.getMe);
router.patch("/me/self", authMiddleware, UserController.updateProfile);

router.get("/", authMiddleware, requireRole("ADMIN"), UserController.listUsers);
router.patch(
  "/:userId/role",
  authMiddleware,
  requireRole("ADMIN"),
  UserController.adminUpdateRole
);

export default router;
