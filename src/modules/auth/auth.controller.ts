import { Request, Response, NextFunction } from "express";
import { User } from "../../models/User";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { HttpException } from "../../core/http-exception";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName } = req.body;

      const existing = await User.findOne({ email });
      if (existing) throw new HttpException(409, "Email already registered");

      const hashed = await hashPassword(password);

      const user = await User.create({
        email,
        password: hashed,
        fullName,
        // isBlocked defaults to false in schema
      });

      const accessToken = signAccessToken({
        userId: user._id.toString(),
        role: user.role,
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
          },
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) throw new HttpException(401, "Invalid credentials");

      // 🔥 Blocked check
      if (user.isBlocked) {
        throw new HttpException(
          403,
          "Your account is blocked. Please contact support."
        );
      }

      const match = await comparePassword(password, user.password);
      if (!match) throw new HttpException(401, "Invalid credentials");

      const accessToken = signAccessToken({
        userId: user._id.toString(),
        role: user.role,
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
          },
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
