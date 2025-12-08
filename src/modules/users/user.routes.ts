import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";

const router = Router();

// ⚠️ Order matters: put /me/self BEFORE "/:id"
router.get("/me/self", authMiddleware, UserController.getMe);
router.patch("/me/self", authMiddleware, UserController.updateProfile);

// Admin: list all users
router.get("/", authMiddleware, requireRole("ADMIN"), UserController.listUsers);

// Admin: generic update (role, isBlocked, verified, etc.)
router.patch(
  "/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  UserController.adminUpdateUser
);

// (optional) dedicated role endpoint, if you still want it
router.patch(
  "/:userId/role",
  authMiddleware,
  requireRole("ADMIN"),
  UserController.adminUpdateRole
);

// Admin: delete user
router.delete(
  "/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  UserController.adminDeleteUser
);

// Get profile by id (normal user)
router.get("/:id", authMiddleware, UserController.getProfile);

export default router;
