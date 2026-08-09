export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public meta?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code?: string,
    meta?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    if (meta !== undefined) {
      this.meta = meta;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
