import { HydratedDocument } from "mongoose";
import { IUser } from "../../models/User";
import { TravelPlan } from "../../models/TravelPlan";
import { JoinRequest } from "../../models/JoinRequest";
import { Review } from "../../models/Review";
import { ReviewService } from "../reviews/review.service";

/**
 * Deletes a user together with everything that points at them, so no plan,
 * request or review is left referencing an account that no longer exists.
 */
export const deleteUserAndContent = async (user: HydratedDocument<IUser>) => {
  const reviewedUsers = await Review.distinct("reviewee", {
    reviewer: user._id,
  });

  const planIds = await TravelPlan.distinct("_id", { user: user._id });

  await Promise.all([
    TravelPlan.deleteMany({ user: user._id }),
    JoinRequest.deleteMany({
      $or: [
        { requester: user._id },
        { host: user._id },
        { travelPlan: { $in: planIds } },
      ],
    }),
    Review.deleteMany({
      $or: [
        { reviewer: user._id },
        { reviewee: user._id },
        { travelPlan: { $in: planIds } },
      ],
    }),
  ]);
  await user.deleteOne();

  // Ratings of the people this user had reviewed need recalculating
  await Promise.all(
    reviewedUsers.map((id) => ReviewService.recalculateRating(String(id)))
  );
};
