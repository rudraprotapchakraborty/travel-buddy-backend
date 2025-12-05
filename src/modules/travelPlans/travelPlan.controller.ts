import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { TravelPlanService } from "./travelPlan.service";
import { HttpException } from "../../core/http-exception";

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
    const plan = await TravelPlanService.getById(req.params.id);
    if (!plan) throw new HttpException(404, "Travel plan not found");
    res.json({ success: true, data: plan });
  }

  static async update(req: AuthRequest, res: Response) {
    const updated = await TravelPlanService.update(
      req.user!.id,
      req.params.id,
      req.body
    );
    if (!updated) throw new HttpException(404, "Travel plan not found or not owned");
    res.json({ success: true, data: updated });
  }

  static async remove(req: AuthRequest, res: Response) {
    const ok = await TravelPlanService.remove(req.user!.id, req.params.id);
    if (!ok) throw new HttpException(404, "Travel plan not found or not owned");
    res.json({ success: true });
  }

  static async match(req: AuthRequest, res: Response) {
    const { destination, startDate, endDate, travelType } = req.query;
    const data = await TravelPlanService.search({
      destination: destination as string,
      startDate: startDate as string,
      endDate: endDate as string,
      travelType: travelType as string,
    });
    res.json({ success: true, data });
  }

  static async listAllForAdmin(req: AuthRequest, res: Response) {
    const plans = await TravelPlanService.listAll();
    res.json({ success: true, data: plans });
  }

  static async updateStatusAdmin(req: AuthRequest, res: Response) {
    const updated = await TravelPlanService.adminUpdateStatus(
      req.params.id,
      req.body.status
    );
    if (!updated) throw new HttpException(404, "Travel plan not found");
    res.json({ success: true, data: updated });
  }
}
