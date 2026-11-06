import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { TravelPlanService } from "./travelPlan.service";
import { HttpException } from "../../core/http-exception";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export class TravelPlanController {
  static async create(req: AuthRequest, res: Response) {
    const plan = await TravelPlanService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: plan });
  }

  static async listMine(req: AuthRequest, res: Response) {
    const plans = await TravelPlanService.listForUser(req.user!.id);
    res.json({ success: true, data: plans });
  }

  static async getById(req: AuthRequest, res: Response) {
    const plan = await TravelPlanService.getById(
      req.params.id as string,
      req.user!.id,
      req.user!.role === "ADMIN"
    );
    if (!plan) throw new HttpException(404, "Travel plan not found");
    res.json({ success: true, data: plan });
  }

  static async update(req: AuthRequest, res: Response) {
    const updated = await TravelPlanService.update(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    if (!updated) {
      throw new HttpException(404, "Travel plan not found or not owned");
    }
    res.json({ success: true, data: updated });
  }

  static async remove(req: AuthRequest, res: Response) {
    const ok = await TravelPlanService.remove(req.user!.id, req.params.id as string);
    if (!ok) throw new HttpException(404, "Travel plan not found or not owned");
    res.json({ success: true });
  }

  static async match(req: AuthRequest, res: Response) {
    const { destination, startDate, endDate, travelType } = req.query;
    const data = await TravelPlanService.search(
      {
        destination: str(destination),
        startDate: str(startDate),
        endDate: str(endDate),
        travelType: str(travelType),
      },
      req.user!.id
    );
    res.json({ success: true, data });
  }

  // Admin
  static async listAllForAdmin(_req: AuthRequest, res: Response) {
    const plans = await TravelPlanService.listAll();
    res.json({ success: true, data: plans });
  }

  static async updateStatusAdmin(req: AuthRequest, res: Response) {
    const updated = await TravelPlanService.adminUpdateStatus(
      req.params.id as string,
      req.body.status
    );
    res.json({ success: true, data: updated });
  }

  static async adminDelete(req: AuthRequest, res: Response) {
    await TravelPlanService.adminDelete(req.params.id as string);
    res.json({ success: true, message: "Travel plan deleted successfully" });
  }
}
