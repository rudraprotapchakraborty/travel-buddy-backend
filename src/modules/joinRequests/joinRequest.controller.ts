import { Response } from "express";
import { AuthRequest } from "../../core/auth-middleware";
import { JoinRequestService } from "./joinRequest.service";
import { HttpException } from "../../core/http-exception";

export class JoinRequestController {
  static async requestJoin(req: AuthRequest, res: Response) {
    const { travelPlanId, message } = req.body;
    try {
      const jr = await JoinRequestService.request(
        req.user!.id,
        travelPlanId,
        message
      );
      res.status(201).json({ success: true, data: jr });
    } catch (e: any) {
      throw new HttpException(400, e.message);
    }
  }

  static async myRequests(req: AuthRequest, res: Response) {
    const data = await JoinRequestService.listForUser(req.user!.id);
    res.json({ success: true, data });
  }

  static async hostRequests(req: AuthRequest, res: Response) {
    const data = await JoinRequestService.listForHost(req.user!.id);
    res.json({ success: true, data });
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const updated = await JoinRequestService.updateStatus(
      req.user!.id,
      req.params.id,
      req.body.status
    );
    if (!updated) throw new HttpException(404, "Join request not found");
    res.json({ success: true, data: updated });
  }
}
