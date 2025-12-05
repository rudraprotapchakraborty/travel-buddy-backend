import { NextFunction, Response, Request } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { HttpException } from "./http-exception";

export interface AuthRequest extends Request {
  user?: { id: string; role: "USER" | "ADMIN" };
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpException(401, "Not authenticated");
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    throw new HttpException(401, "Invalid or expired token");
  }
};
