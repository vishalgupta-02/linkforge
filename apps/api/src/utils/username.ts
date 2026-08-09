import { RESERVED_USERNAMES } from "../constants/reserved.ts";
import { randomBytes } from "crypto";

// utils/username.ts
export const normalizeUsername = (username: string) =>
  username.trim().toLowerCase();

export const isValidUsername = (username: string) => {
  return /^[A-Za-z][A-Za-z0-9_]{1,18}[A-Za-z0-9]$/.test(
    normalizeUsername(username),
  );
};

export const isReservedUsername = (username: string) => {
  return RESERVED_USERNAMES.has(normalizeUsername(username));
};

export const generateUsername = (name: string): string => {
  const [firstWord = ""] = name.toLowerCase().trim().split(/\s+/);

  const base = firstWord.replace(/[^a-z0-9]/g, ""); // remove special chars

  const safeBase = (base || "user").slice(0, 12);

  // Generate a safe suffix using only alphanumeric characters (no - or special chars)
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  const randomBytes_val = randomBytes(3);
  for (let i = 0; i < 4; i++) {
    suffix += characters[randomBytes_val[i % 3] % characters.length];
  }

  return `${safeBase}_${suffix}`;
};
