import { NextFunction, Request, Response } from "express";
import { HttpException } from "./http-exception";

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof HttpException) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
