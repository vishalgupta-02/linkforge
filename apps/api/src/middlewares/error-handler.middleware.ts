// It needs:
// - 4 parameter signature — `err, req, res, next`
// - Read `NODE_ENV` from your config
// - In development — include error message and stack trace in response
// - In production — return only a generic "Something went wrong" message
// - Always return consistent `ApiResponse` shape
// - Handle specific error types — what if the error has a status code? What if it is a Prisma error? What if it is a Zod validation error?
// - HTTP status code — default to 500 but use the error's status code if it has one

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "apps/api/generated/prisma/client.ts";

const NODE_ENV = process.env.NODE_ENV || "development";

type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data: T | null;
  error?: unknown;
};

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = undefined;

  // 🔹 1. Custom error with statusCode
  if (err && typeof err === "object" && "statusCode" in err) {
    statusCode = (err as { statusCode: number }).statusCode;
    message = (err as { message?: string }).message || message;
  }

  // 🔹 2. Zod validation error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // 🔹 3. Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    if (err.code === "P2002") {
      message = "Unique constraint failed";
      errorDetails = err.meta;
    } else {
      message = "Database error";
      errorDetails = err.message;
    }
  }

  // 🔹 4. Fallback generic error
  else if (err instanceof Error) {
    message = err.message || message;
  }

  // 🧪 Dev vs Prod behavior
  const response: ApiResponse = {
    success: false,
    message,
    data: null,
  };

  if (NODE_ENV === "development") {
    response.error = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      details: errorDetails,
    };
  }

  return res.status(statusCode).json(response);
}
