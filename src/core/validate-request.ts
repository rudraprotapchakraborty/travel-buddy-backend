import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { HttpException } from "./http-exception";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new HttpException(400, "Validation failed", error.flatten());
      }
      next(error);
    }
  };
