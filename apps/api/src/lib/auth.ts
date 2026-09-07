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

const appBaseUrl =
  process.env.FRONTEND_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.BETTER_AUTH_URL?.replace(/\/api\/auth.*/, "") ||
  "http://localhost:3000";

const dashboardUrl = `${appBaseUrl.replace(/\/$/, "")}/dashboard`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""))
      : []),
    "https://*.vercel.app",
    "https://*.yourdomain.com",
  ],
  account: {
    storeAccountCookie: true,
    storeStateStrategy: "database",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth",
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: (process.env.GOOGLE_OAUTH_CLIENT_ID || "") as string,
      clientSecret: (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "") as string,
      redirectURI:
        process.env.GOOGLE_OAUTH_REDIRECT_URI ||
        `${(process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth").replace(/\/$/, "")}/callback/google`,
    },
    github: {
      clientId: (process.env.GITHUB_OAUTH_CLIENT_ID || "") as string,
      clientSecret: (process.env.GITHUB_OAUTH_CLIENT_SECRET || "") as string,
      redirectURI:
        process.env.GITHUB_OAUTH_REDIRECT_URI ||
        `${(process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth").replace(/\/$/, "")}/callback/github`,
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
              console.log(`✅ [BEFORE CREATE] Requested username is valid and available: ${generatedOne}`);
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
