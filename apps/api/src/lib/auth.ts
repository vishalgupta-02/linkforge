import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/client.ts";
import {
  generateUsername,
  normalizeUsername,
  isValidUsername,
  isReservedUsername,
} from "../utils/username.ts";
import { isUsernameAvailable } from "../services/username.service.ts";
import { enqueueWelcomeEmail } from "../queues/email.queue.ts";
import { recordUserSignup } from "./metrics.ts";

import {
  getAllowedOrigins,
  isOriginAllowed,
  sanitizeOrigin,
} from "../middlewares/cors.ts";

const frontendBaseUrl =
  sanitizeOrigin(process.env.FRONTEND_URL) ||
  sanitizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
  sanitizeOrigin(process.env.APP_URL) ||
  "http://localhost:3000";

const rawBackendAuthUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const backendBaseUrl = sanitizeOrigin(rawBackendAuthUrl);
const backendApiOrigin = backendBaseUrl.replace(/\/api\/auth\/?$/, "");

const dashboardUrl = `${frontendBaseUrl}/dashboard`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
  baseURL: backendBaseUrl,
  trustedOrigins: async (request) => {
    const origins = [
      ...getAllowedOrigins(),
      frontendBaseUrl,
      backendApiOrigin,
      "https://*.vercel.app",
      "https://*.railway.app",
      "https://*.up.railway.app",
      "http://localhost:*",
      "http://127.0.0.1:*",
    ];
    const origin = request?.headers?.get("origin");
    if (origin && isOriginAllowed(origin)) {
      origins.push(sanitizeOrigin(origin));
    }
    return Array.from(new Set(origins));
  },
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      // In production cross-site context (vercel.app -> railway.app), SameSite MUST be 'none'
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    disableSessionRefresh: true,
    updateAge: 24 * 60 * 60,
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: (process.env.GOOGLE_OAUTH_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "") as string,
      clientSecret: (process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        "") as string,
      redirectURI:
        process.env.GOOGLE_CALLBACK_URL ||
        process.env.GOOGLE_OAUTH_REDIRECT_URI ||
        process.env.GOOGLE_REDIRECT_URI ||
        `${backendApiOrigin}/api/auth/callback/google`,
    },
    github: {
      clientId: (process.env.GITHUB_OAUTH_CLIENT_ID ||
        process.env.GITHUB_CLIENT_ID ||
        "") as string,
      clientSecret: (process.env.GITHUB_OAUTH_CLIENT_SECRET ||
        process.env.GITHUB_CLIENT_SECRET ||
        "") as string,
      redirectURI:
        process.env.GITHUB_CALLBACK_URL ||
        process.env.GITHUB_OAUTH_REDIRECT_URI ||
        process.env.GITHUB_REDIRECT_URI ||
        `${backendApiOrigin}/api/auth/callback/github`,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data, _context) => {
          try {
            console.log("🔍 [BEFORE CREATE] User data:", {
              name: data.name,
              email: data.email,
              provider: data.emailVerified ? "email" : "unknown",
            });

            const candidateName = data.name ? normalizeUsername(data.name) : "";
            let generatedOne = "";

            if (
              candidateName &&
              isValidUsername(candidateName) &&
              !isReservedUsername(candidateName) &&
              (await isUsernameAvailable(candidateName))
            ) {
              generatedOne = candidateName;
              console.log(
                `✅ [BEFORE CREATE] Requested username is valid and available: ${generatedOne}`,
              );
            } else {
              // Generate username from user's name (works for both email/password and social signin)
              generatedOne = generateUsername(
                data.name || data.email || "user",
              );

              console.log(`📝 Generated initial username: ${generatedOne}`);

              let attempts = 0;
              const maxAttempts = 5;

              while (
                !(await isUsernameAvailable(generatedOne)) &&
                attempts < maxAttempts
              ) {
                console.log(
                  `⚠️ Username ${generatedOne} taken, attempt ${attempts + 1}/${maxAttempts}`,
                );
                generatedOne = generateUsername(
                  data.name || data.email || "user",
                );
                attempts++;
              }

              if (attempts === maxAttempts) {
                generatedOne = `user_${Date.now()}`;
                console.log(
                  `⚠️ Max attempts reached, using fallback: ${generatedOne}`,
                );
              }
            }

            console.log(
              `✅ [BEFORE CREATE] Assigned username: ${generatedOne}`,
            );

            return {
              data: {
                ...data,
                userName: generatedOne,
                userName_lower: normalizeUsername(generatedOne),
                lastUsernameChangedAt: new Date(),
              },
            };
          } catch (error) {
            console.error("❌ [BEFORE CREATE] Error:", error);

            const fallback = `user_${Date.now()}`;
            console.log(`🆘 Using fallback username: ${fallback}`);

            return {
              data: {
                ...data,
                userName: fallback,
                userName_lower: normalizeUsername(fallback),
                lastUsernameChangedAt: new Date(),
              },
            };
          }
        },
        after: async (user) => {
          let resolvedUsername = user.userName;

          // Backup: if username is still NULL after creation, generate it
          if (!resolvedUsername) {
            console.warn(
              `⚠️ [AFTER CREATE] User ${user.id} has NULL username, generating now...`,
            );

            let generatedOne = generateUsername(
              user.name || user.email || "user",
            );
            let attempts = 0;

            while (!(await isUsernameAvailable(generatedOne)) && attempts < 5) {
              generatedOne = generateUsername(
                user.name || user.email || "user",
              );
              attempts++;
            }

            if (attempts >= 5) {
              generatedOne = `user_${Date.now()}`;
            }

            console.log(
              `✅ [AFTER CREATE] Generated username for ${user.email}: ${generatedOne}`,
            );

            resolvedUsername = generatedOne;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                userName: generatedOne,
                userName_lower: normalizeUsername(generatedOne),
              },
            });
          }

          recordUserSignup();

          // 📬 Asynchronously enqueue welcome email job into BullMQ
          try {
            const finalUserName = resolvedUsername || user.name || "Creator";
            await enqueueWelcomeEmail({
              userId: user.id,
              userName: finalUserName,
              email: user.email,
              dashboardUrl,
            });
            console.log(
              `📬 [AFTER CREATE] Enqueued welcome email job for user ${user.id} (${user.email})`,
            );
          } catch (queueError) {
            console.error(
              `❌ [AFTER CREATE] Failed to enqueue welcome email job for user ${user.id}:`,
              queueError,
            );
          }
        },
      },
    },
  },
});
