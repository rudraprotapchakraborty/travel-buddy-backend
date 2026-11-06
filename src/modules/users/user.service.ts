import { User } from "../../models/User";
import { HttpException } from "../../core/http-exception";

const PUBLIC_FIELDS =
  "fullName bio profileImageUrl travelInterests visitedCountries currentLocation avgRating reviewCount isVerified createdAt";

export class UserService {
  static async getById(id: string) {
    return User.findById(id).select("-password");
  }

  /** Profile as seen by other users (no email, role or subscription data). */
  static async getPublicProfile(id: string) {
    return User.findById(id).select(PUBLIC_FIELDS);
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
      runValidators: true,
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

  static async adminUpdateUser(
    userId: string,
    payload: Partial<{
      role: "USER" | "ADMIN";
      isBlocked: boolean;
      isVerified: boolean;
      verified: boolean;
    }>
  ) {
    const update: Record<string, unknown> = {};
    if (payload.role) update.role = payload.role;
    if (typeof payload.isBlocked === "boolean") update.isBlocked = payload.isBlocked;
    const verified = payload.isVerified ?? payload.verified;
    if (typeof verified === "boolean") update.isVerified = verified;

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) throw new HttpException(404, "User not found");
    return user;
  }

  static async adminDeleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new HttpException(404, "User not found");
  }
}
