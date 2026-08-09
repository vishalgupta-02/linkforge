import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { AppError } from "../utils/api-error.ts";

type Schema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate each part separately
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as Record<string, string>;
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as Record<string, string>;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return next(
          new AppError("Validation failed", 400, "VALIDATION_ERROR", formatted),
        );
      }

      next(error);
    }
  };
};
