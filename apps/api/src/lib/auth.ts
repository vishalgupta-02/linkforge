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
import {
  enqueueWelcomeEmail,
  enqueueVerificationEmail,
} from "../queues/email.queue.ts";
import { recordUserSignup } from "./metrics.ts";

import {
  getAllowedOrigins,
  isOriginAllowed,
  sanitizeOrigin,
} from "../middlewares/cors.ts";

const frontendBaseUrl =
  sanitizeOrigin(process.env.FRONTEND_URL) ||
  sanitizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
  "http://localhost:3000";

const rawBackendAuthUrl =
  process.env.BETTER_AUTH_URL || process.env.BACKEND_URL;

if (!rawBackendAuthUrl) {
  throw new Error("BETTER_AUTH_URL or BACKEND_URL must be configured");
}

const backendBaseUrl = sanitizeOrigin(rawBackendAuthUrl);

if (!backendBaseUrl) {
  throw new Error("Invalid Better Auth backend URL");
}

const backendApiOrigin = backendBaseUrl.replace(/\/api\/auth\/?$/, "");

const dashboardUrl = `${frontendBaseUrl}/dashboard`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
  baseURL: backendBaseUrl,
  // trustedOrigins: async (request) => {
  //   const origins = [
  //     ...getAllowedOrigins(),
  //     frontendBaseUrl,
  //     backendApiOrigin,
  //     "https://*.vercel.app",
  //     "http://localhost:*",
  //     "http://127.0.0.1:*",
  //   ];

  //   const origin = request?.headers?.get("origin");

  //   if (origin && isOriginAllowed(origin)) {
  //     origins.push(sanitizeOrigin(origin));
  //   }

  //   return Array.from(new Set(origins));
  // },
  trustedOrigins: [
    frontendBaseUrl,
    backendApiOrigin,
    "http://localhost:3000",
    "http://localhost:5000",
    "https://*.vercel.app",
  ],
  advanced: {
    useSecureCookies: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      const verificationUrl = `${backendApiOrigin}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(`${frontendBaseUrl}/signin?verified=true`)}`;
      try {
        await enqueueVerificationEmail({
          userId: user.id,
          userName: user.name || "Creator",
          email: user.email,
          verificationUrl,
        });
        console.log(
          `🔒 [AUTH] Enqueued verification email for user ${user.id} (${user.email})`,
        );
      } catch (err) {
        console.error("❌ [AUTH] Failed to enqueue verification email:", err);
      }
    },
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
          const authUser = user as {
            id: string;
            email: string;
            userName?: string;
            name?: string;
          };
          let resolvedUsername =
            typeof authUser.userName === "string"
              ? authUser.userName
              : undefined;

          if (!resolvedUsername) {
            console.warn(
              `⚠️ [AFTER CREATE] User ${authUser.id} has NULL username, generating now...`,
            );

            let generatedOne = generateUsername(
              authUser.name || authUser.email || "user",
            );
            let attempts = 0;

            while (!(await isUsernameAvailable(generatedOne)) && attempts < 5) {
              generatedOne = generateUsername(
                authUser.name || authUser.email || "user",
              );
              attempts++;
            }

            if (attempts >= 5) {
              generatedOne = `user_${Date.now()}`;
            }

            console.log(
              `✅ [AFTER CREATE] Generated username for ${authUser.email}: ${generatedOne}`,
            );

            resolvedUsername = generatedOne;

            await prisma.user.update({
              where: { id: authUser.id },
              data: {
                userName: generatedOne,
                userName_lower: normalizeUsername(generatedOne),
              },
            });
          }

          recordUserSignup();

          try {
            const finalUserName =
              resolvedUsername || authUser.name || "Creator";
            await enqueueWelcomeEmail({
              userId: authUser.id,
              userName: String(finalUserName),
              email: authUser.email,
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
