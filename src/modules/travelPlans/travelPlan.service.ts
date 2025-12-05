import { TravelPlan } from "../../models/TravelPlan";
import { Types } from "mongoose";

export class TravelPlanService {
  static async create(userId: string, payload: any) {
    return TravelPlan.create({
      user: new Types.ObjectId(userId),
      destination: payload.destination,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
      isPublic: payload.isPublic ?? true,
    });
  }

  static async listForUser(userId: string) {
    return TravelPlan.find({ user: userId }).sort({ startDate: 1 });
  }

  static async getById(id: string) {
    return TravelPlan.findById(id).populate({
      path: "user",
      select: "fullName profileImageUrl avgRating",
    });
  }

  static async update(userId: string, id: string, data: any) {
    const plan = await TravelPlan.findOne({ _id: id, user: userId });
    if (!plan) return null;

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    Object.assign(plan, data);
    await plan.save();
    return plan;
  }

  static async remove(userId: string, id: string) {
    const res = await TravelPlan.deleteOne({ _id: id, user: userId });
    return res.deletedCount === 1;
  }

  static async search(filters: {
    destination?: string;
    startDate?: string;
    endDate?: string;
    travelType?: string;
  }) {
    const query: any = { isPublic: true, status: "PLANNED" };

    if (filters.destination) {
      query.destination = {
        $regex: filters.destination,
        $options: "i",
      };
    }

    if (filters.startDate && filters.endDate) {
      query.startDate = { $lte: new Date(filters.endDate) };
      query.endDate = { $gte: new Date(filters.startDate) };
    }

    if (filters.travelType) {
      query.travelType = filters.travelType;
    }

    return TravelPlan.find(query).populate({
      path: "user",
      select:
        "fullName profileImageUrl travelInterests avgRating currentLocation",
    });
  }

  static async listAll() {
    return TravelPlan.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "fullName email" });
  }

  static async adminUpdateStatus(id: string, status: string) {
    return TravelPlan.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}
