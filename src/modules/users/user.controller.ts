import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { UserService } from "./user.service";
import { HttpException } from "../../core/http-exception";

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    const user = await UserService.getById(req.params.id);
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await UserService.listUsers(page, limit);
    res.json({ success: true, data });
  }

  static async adminUpdateRole(req: AuthRequest, res: Response) {
    const updated = await UserService.adminUpdateRole(
      req.params.userId,
      req.body.role
    );
    res.json({ success: true, data: updated });
  }
}
