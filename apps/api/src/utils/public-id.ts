import crypto from "crypto";

/**
 * Generate a cryptographically secure, URL-safe random public identifier.
 * 12 random bytes = 96 bits of entropy -> 16 URL-safe characters (Base64URL).
 * Guaranteed to have high entropy, cannot be enumerated or guessed, and
 * is completely decoupled from database internal IDs.
 */
export function generatePublicId(bytes = 12): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Validate format of a public identifier.
 * Must be a non-empty alphanumeric string with URL-safe base64url characters (-_).
 */
export function isValidPublicId(publicId: unknown): publicId is string {
  if (typeof publicId !== "string") {
    return false;
  }
  // Base64URL string between 8 and 64 characters
  return /^[A-Za-z0-9_-]{8,64}$/.test(publicId);
}
