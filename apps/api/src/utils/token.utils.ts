import crypto from "crypto";

/**
 * Generate a cryptographically secure random token string.
 * Default 32 bytes provides 256 bits of entropy.
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Computes the SHA-256 hash of a raw token.
 * Only the token hash is stored in the database.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
