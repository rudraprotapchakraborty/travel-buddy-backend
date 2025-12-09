import { Request, Response, NextFunction } from "express";
import { TravelPlanService } from "./travelPlan.service";
import { HttpException } from "../../core/http-exception";

export class TravelPlanController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await TravelPlanService.create((req as any).user!.id, req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await TravelPlanService.listForUser((req as any).user!.id);
      res.json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await TravelPlanService.getById(req.params.id);
      if (!plan) throw new HttpException(404, "Travel plan not found");
      res.json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await TravelPlanService.update(
        (req as any).user!.id,
        req.params.id,
        req.body
      );
      if (!updated)
        throw new HttpException(404, "Travel plan not found or not owned");
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const ok = await TravelPlanService.remove((req as any).user!.id, req.params.id);
      if (!ok) throw new HttpException(404, "Travel plan not found or not owned");
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async match(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination, startDate, endDate, travelType } = req.query;
      const data = await TravelPlanService.search({
        destination: destination as string,
        startDate: startDate as string,
        endDate: endDate as string,
        travelType: travelType as string,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // Admin
  static async listAllForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await TravelPlanService.listAll();
      res.json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatusAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await TravelPlanService.adminUpdateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async adminDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await TravelPlanService.adminDelete(req.params.id);
      res.json({ success: true, message: "Travel plan deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
