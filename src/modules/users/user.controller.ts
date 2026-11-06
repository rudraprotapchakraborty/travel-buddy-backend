import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { UserService } from "./user.service";
import { HttpException } from "../../core/http-exception";
import { User } from "../../models/User";

/** A demo admin can only manage other demo accounts, never real members. */
const assertDemoScope = async (req: AuthRequest, targetId: string) => {
  if (!req.user?.isDemo) return;
  const target = await User.findById(targetId).select("isDemo");
  if (!target?.isDemo) {
    throw new HttpException(403, "Test accounts can only manage test data.");
  }
};

const clampInt = (value: unknown, fallback: number, min: number, max: number) => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    // Admins see the full record; everyone else only the public fields
    const id = req.params.id as string;
    const user =
      req.user!.role === "ADMIN" || req.user!.id === id
        ? await UserService.getById(id)
        : await UserService.getPublicProfile(id);
    if (!user) throw new HttpException(404, "User not found");
    res.json({ success: true, data: user });
  }

  static async getMe(req: AuthRequest, res: Response) {
    const user = await UserService.getById(req.user!.id);
    if (!user) throw new HttpException(404, "User not found");
    res.json({ success: true, data: user });
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    const updated = await UserService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: updated });
  }

  static async listUsers(req: AuthRequest, res: Response) {
    const page = clampInt(req.query.page, 1, 1, 10_000);
    const limit = clampInt(req.query.limit, 20, 1, 100);
    const data = await UserService.listUsers(page, limit);
    res.json({ success: true, data });
  }

  static async adminUpdateRole(req: AuthRequest, res: Response) {
    const userId = req.params.userId as string;
    await assertDemoScope(req, userId);
    if (userId === req.user!.id && req.body.role !== "ADMIN") {
      throw new HttpException(400, "You cannot remove your own admin role");
    }
    const updated = await UserService.adminUpdateUser(userId, {
      role: req.body.role,
    });
    res.json({ success: true, data: updated });
  }

  static async adminUpdateUser(req: AuthRequest, res: Response) {
    const userId = req.params.userId as string;
    await assertDemoScope(req, userId);
    if (
      userId === req.user!.id &&
      (req.body.isBlocked === true ||
        (req.body.role && req.body.role !== "ADMIN"))
    ) {
      throw new HttpException(400, "You cannot block or demote yourself");
    }
    const updated = await UserService.adminUpdateUser(userId, req.body);
    res.json({ success: true, data: updated });
  }

  static async adminDeleteUser(req: AuthRequest, res: Response) {
    const userId = req.params.userId as string;
    await assertDemoScope(req, userId);
    if (userId === req.user!.id) {
      throw new HttpException(400, "You cannot delete your own account here");
    }
    await UserService.adminDeleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  }
}
