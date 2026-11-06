import mongoose from "mongoose";
import { env } from "./env";
import { User } from "../models/User";

// Serverless platforms (Vercel) reuse a warm instance between requests, so the
// connection is cached on the global object instead of reconnecting every time.
const globalCache = globalThis as unknown as {
  __mongo?: Promise<typeof mongoose>;
};

export const connectDB = async () => {
  if (!globalCache.__mongo) {
    globalCache.__mongo = mongoose
      .connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB,
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      })
      .then(async (m) => {
        console.log("MongoDB connected");

        // Accounts created before email verification existed keep working.
        await User.updateMany(
          { emailVerified: { $exists: false } },
          { $set: { emailVerified: true } }
        );
        return m;
      })
      .catch((err) => {
        globalCache.__mongo = undefined; // allow a retry on the next request
        throw err;
      });
  }
  return globalCache.__mongo;
};

export const disconnectDB = () => mongoose.disconnect();
