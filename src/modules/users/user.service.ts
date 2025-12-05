import { User } from "../../models/User";

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
}
