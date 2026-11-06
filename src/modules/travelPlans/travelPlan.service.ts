import { Types } from "mongoose";
import { TravelPlan } from "../../models/TravelPlan";
import { HttpException } from "../../core/http-exception";
import { escapeRegex } from "../../core/object-id";

const TRAVEL_TYPES = ["SOLO", "FAMILY", "FRIENDS"];

export class TravelPlanService {
  static async create(userId: string, payload: any) {
    return TravelPlan.create({
      user: new Types.ObjectId(userId),
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
      isPublic: payload.isPublic ?? true,
      status: payload.status ?? "PLANNED",
    });
  }

  static async listForUser(userId: string) {
    return TravelPlan.find({ user: userId }).sort({ startDate: 1 });
  }

  /** Private plans are only visible to their owner and admins. */
  static async getById(id: string, viewerId: string, isAdmin: boolean) {
    const plan = await TravelPlan.findById(id).populate({
      path: "user",
      select: "fullName profileImageUrl avgRating",
    });
    if (!plan) return null;

    const ownerId = (plan.user as any)?._id?.toString() ?? String(plan.user);
    if (!plan.isPublic && ownerId !== viewerId && !isAdmin) return null;
    return plan;
  }

  static async update(userId: string, id: string, data: any) {
    const plan = await TravelPlan.findOne({ _id: id, user: userId });
    if (!plan) return null;

    Object.assign(plan, data);
    if (plan.endDate < plan.startDate) {
      throw new HttpException(400, "End date must be after the start date");
    }
    if (
      plan.budgetMin != null &&
      plan.budgetMax != null &&
      plan.budgetMin > plan.budgetMax
    ) {
      throw new HttpException(400, "Minimum budget cannot exceed maximum budget");
    }
    await plan.save();
    return plan;
  }

  static async remove(userId: string, id: string) {
    const res = await TravelPlan.deleteOne({ _id: id, user: userId });
    return res.deletedCount === 1;
  }

  static async search(
    filters: {
      destination?: string;
      startDate?: string;
      endDate?: string;
      travelType?: string;
    },
    viewerId: string
  ) {
    const query: Record<string, any> = {
      isPublic: true,
      status: "PLANNED",
      user: { $ne: viewerId },
    };

    if (filters.destination) {
      query.destination = {
        $regex: escapeRegex(filters.destination.slice(0, 100)),
        $options: "i",
      };
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new HttpException(400, "Invalid date filter");
      }
      query.startDate = { $lte: end };
      query.endDate = { $gte: start };
    }

    if (filters.travelType) {
      if (!TRAVEL_TYPES.includes(filters.travelType)) {
        throw new HttpException(400, "Invalid travel type");
      }
      query.travelType = filters.travelType;
    }

    return TravelPlan.find(query)
      .sort({ startDate: 1 })
      .limit(100)
      .populate({
        path: "user",
        select:
          "fullName profileImageUrl travelInterests avgRating currentLocation",
      });
  }

  // ---- Admin ----

  static async listAll() {
    return TravelPlan.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .populate({ path: "user", select: "fullName email" });
  }

  static async adminUpdateStatus(id: string, status: string) {
    const plan = await TravelPlan.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate({ path: "user", select: "fullName email" });

    if (!plan) throw new HttpException(404, "Travel plan not found");
    return plan;
  }

  static async adminDelete(id: string): Promise<void> {
    const plan = await TravelPlan.findByIdAndDelete(id);
    if (!plan) throw new HttpException(404, "Travel plan not found");
  }
}
