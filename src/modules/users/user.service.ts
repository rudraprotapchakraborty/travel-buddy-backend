import { User } from "../../models/User";
import { HttpException } from "../../core/http-exception";

export class UserService {
  static async getById(id: string) {
    return User.findById(id).select("-password");
  }

  static async updateProfile(
    userId: string,
    payload: Partial<{
      fullName: string;
      bio: string;
      profileImageUrl: string;
      travelInterests: string[];
      visitedCountries: string[];
      currentLocation: string;
    }>
  ) {
    return User.findByIdAndUpdate(userId, payload, {
      new: true,
    }).select("-password");
  }

  static async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    return { users, total, page, limit };
  }

  static async adminUpdateRole(userId: string, role: "USER" | "ADMIN") {
    return User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");
  }

  // ✅ NEW: generic admin update for Manage Users page
  static async adminUpdateUser(
    userId: string,
    payload: Partial<{
      role: "USER" | "ADMIN";
      isBlocked: boolean;
      verified: boolean;
    }>
  ) {
    const update: any = {};

    if (payload.role) update.role = payload.role;
    if (typeof payload.isBlocked === "boolean") {
      update.isBlocked = payload.isBlocked;
    }
    if (typeof payload.verified === "boolean") {
      update.verified = payload.verified;
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return user;
  }

  // ✅ NEW: admin delete (hard delete; switch to soft if you want)
  static async adminDeleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }
  }
}
