import { JoinRequest } from "../../models/JoinRequest";
import { TravelPlan } from "../../models/TravelPlan";
import { Types } from "mongoose";

export class JoinRequestService {
  static async request(
    requesterId: string,
    travelPlanId: string,
    message?: string
  ) {
    const plan = await TravelPlan.findById(travelPlanId);
    if (!plan) throw new Error("Travel plan not found");
    if (plan.user.toString() === requesterId)
      throw new Error("Cannot request your own plan");

    return JoinRequest.create({
      travelPlan: new Types.ObjectId(travelPlanId),
      requester: new Types.ObjectId(requesterId),
      host: plan.user,
      message,
    });
  }

  static async listForUser(userId: string) {
    return JoinRequest.find({ requester: userId })
      .populate("travelPlan")
      .sort({ createdAt: -1 });
  }

  static async listForHost(hostId: string) {
    return JoinRequest.find({ host: hostId })
      .populate("travelPlan")
      .populate("requester", "fullName profileImageUrl avgRating")
      .sort({ createdAt: -1 });
  }

  static async updateStatus(
    hostId: string,
    id: string,
    status: string
  ) {
    const jr = await JoinRequest.findById(id);
    if (!jr || jr.host.toString() !== hostId) return null;
    jr.status = status as any;
    await jr.save();
    return jr;
  }
}
