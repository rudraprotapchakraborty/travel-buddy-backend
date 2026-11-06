import { Router } from "express";
import { UserController } from "./user.controller";
import { AccountController } from "./user.account";
import { authMiddleware } from "../../core/auth-middleware";
import { requireRole } from "../../core/role-middleware";
import { validateRequest } from "../../core/validate-request";
import { authLimiter } from "../../core/rate-limit";
import {
  adminUpdateRoleSchema,
  adminUpdateUserSchema,
  changePasswordSchema,
  confirmEmailChangeSchema,
  deleteAccountSchema,
  profileParamSchema,
  requestEmailChangeSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "./user.types";

const router = Router();

// Own account. These must come before "/:id".
router.get("/me/self", authMiddleware, UserController.getMe);
router.patch(
  "/me/self",
  authMiddleware,
  validateRequest(updateProfileSchema),
  UserController.updateProfile
);
router.get("/me/methods", authMiddleware, AccountController.methods);
router.post(
  "/me/password",
  authMiddleware,
  authLimiter,
  validateRequest(changePasswordSchema),
  AccountController.changePassword
);
router.post(
  "/me/email",
  authMiddleware,
  authLimiter,
  validateRequest(requestEmailChangeSchema),
  AccountController.requestEmailChange
);
router.put(
  "/me/email",
  authMiddleware,
  authLimiter,
  validateRequest(confirmEmailChangeSchema),
  AccountController.confirmEmailChange
);
router.delete(
  "/me",
  authMiddleware,
  validateRequest(deleteAccountSchema),
  AccountController.deleteAccount
);

// Admin
router.get("/", authMiddleware, requireRole("ADMIN"), UserController.listUsers);

router.patch(
  "/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest(adminUpdateUserSchema),
  UserController.adminUpdateUser
);

router.patch(
  "/:userId/role",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest(adminUpdateRoleSchema),
  UserController.adminUpdateRole
);

router.delete(
  "/:userId",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest(userIdParamSchema),
  UserController.adminDeleteUser
);

router.get(
  "/:id",
  authMiddleware,
  validateRequest(profileParamSchema),
  UserController.getProfile
);

export default router;
