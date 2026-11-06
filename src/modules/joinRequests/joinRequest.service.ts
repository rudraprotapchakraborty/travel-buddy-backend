import { Types } from "mongoose";
import { JoinRequest, JoinRequestStatus } from "../../models/JoinRequest";
import { TravelPlan } from "../../models/TravelPlan";
import { HttpException } from "../../core/http-exception";

export class JoinRequestService {
  static async request(requesterId: string, travelPlanId: string, message?: string) {
    const plan = await TravelPlan.findById(travelPlanId);
    if (!plan) throw new HttpException(404, "Travel plan not found");
    if (plan.user.toString() === requesterId) {
      throw new HttpException(400, "Cannot request your own plan");
    }
    if (!plan.isPublic || plan.status !== "PLANNED") {
      throw new HttpException(400, "This plan is not open for join requests");
    }

    const duplicate = await JoinRequest.exists({
      travelPlan: plan._id,
      requester: requesterId,
      status: { $in: ["PENDING", "ACCEPTED"] },
    });
    if (duplicate) {
      throw new HttpException(409, "You already have a request for this plan");
    }

    return JoinRequest.create({
      travelPlan: new Types.ObjectId(travelPlanId),
      requester: new Types.ObjectId(requesterId),
      host: plan.user,
      message,
    });
  }

  static async listForUser(userId: string) {
    const list = await JoinRequest.find({ requester: userId })
      .populate("travelPlan")
      .sort({ createdAt: -1 })
      .limit(200);
    return list.filter((r) => r.travelPlan);
  }

  static async listForHost(hostId: string) {
    const list = await JoinRequest.find({ host: hostId })
      .populate("travelPlan")
      .populate("requester", "fullName profileImageUrl avgRating")
      .sort({ createdAt: -1 })
      .limit(200);
    return list.filter((r) => r.travelPlan && r.requester);
  }

  /**
   * The host can accept / reject / reset a request; the requester can only
   * cancel their own. Anyone else gets a 404.
   */
  static async updateStatus(userId: string, id: string, status: JoinRequestStatus) {
    const jr = await JoinRequest.findById(id);
    if (!jr) return null;

    const isHost = jr.host.toString() === userId;
    const isRequester = jr.requester.toString() === userId;
    if (!isHost && !isRequester) return null;

    if (!isHost && status !== "CANCELLED") {
      throw new HttpException(403, "You can only cancel your own request");
    }

    jr.status = status;
    await jr.save();
    return jr;
  }
}
