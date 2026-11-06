import { Schema, model, Document } from "mongoose";

export type UserRole = "USER" | "ADMIN";
export type SubscriptionStatus = "NONE" | "ACTIVE" | "CANCELLED" | "EXPIRED";
export type SubscriptionPlan = "MONTHLY" | "YEARLY" | null;

export interface IUser extends Document {
  email: string;
  password?: string;
  googleId?: string;
  emailVerified: boolean;
  fullName: string;
  bio?: string;
  profileImageUrl?: string;
  travelInterests: string[];
  visitedCountries: string[];
  currentLocation?: string;
  role: UserRole;
  avgRating: number;
  reviewCount: number;

  isBlocked: boolean; 

  isVerified: boolean;
  /** Shared test account shown on the login page; sign-in details are locked */
  isDemo: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: "MONTHLY" | "YEARLY";
  subscriptionEndAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    // Optional: accounts created through Google sign-in have no password
    password: { type: String, select: false },
    googleId: { type: String, index: true, sparse: true },
    emailVerified: { type: Boolean, default: false },
    fullName: { type: String, required: true },
    bio: String,
    profileImageUrl: String,
    travelInterests: { type: [String], default: [] },
    visitedCountries: { type: [String], default: [] },
    currentLocation: String,
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    isBlocked: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false, index: true },
    subscriptionStatus: {
      type: String,
      enum: ["NONE", "ACTIVE", "CANCELLED", "EXPIRED"],
      default: "NONE",
    },
    subscriptionPlan: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      required: false,
    },
    subscriptionEndAt: Date,
  },
  { timestamps: true }
);


export const User = model<IUser>("User", userSchema);
