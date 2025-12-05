import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

const accessTokenSecret: Secret = env.JWT_ACCESS_SECRET;

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    // cast because env.JWT_ACCESS_EXPIRES_IN is just string
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, accessTokenSecret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessTokenSecret) as JwtPayload;
};
