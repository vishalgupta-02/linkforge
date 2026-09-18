import crypto from "crypto";

export function generatePublicId(bytes = 12): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function isValidPublicId(publicId: unknown): publicId is string {
  if (typeof publicId !== "string") {
    return false;
  }

  return /^[A-Za-z0-9_-]{8,64}$/.test(publicId);
}
