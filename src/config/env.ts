import dotenv from "dotenv";
dotenv.config({ quiet: true });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

export const env = {
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: required("MONGODB_URI"),
  // Own database, so Travel Buddy never shares collections (or their indexes)
  // with other apps on the same cluster.
  MONGODB_DB: process.env.MONGODB_DB || "travel_buddy",
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: isProduction
    ? required("STRIPE_WEBHOOK_SECRET")
    : process.env.STRIPE_WEBHOOK_SECRET || undefined,
  // Comma separated list of allowed browser origins
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // Google sign-in (optional until credentials are provided)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",

  // Email (SMTP first, Resend as fallback)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "",

  // Image hosting (ImgBB)
  IMGBB_API_KEY: process.env.IMGBB_API_KEY || "",
};
