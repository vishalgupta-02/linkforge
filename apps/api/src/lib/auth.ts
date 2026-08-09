import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/client.ts";
import { generateUsername, normalizeUsername } from "../utils/username.ts";
import { isUsernameAvailable } from "../services/username.service.ts";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.yourdomain.com", // All subdomains
  ],
  account: {
    storeAccountCookie: true,
    storeStateStrategy: "database",
    cookieOptions: {
      secure: false, // Set to false for localhost development
      sameSite: "lax", // Use "lax" for better security while allowing cross-origin requests
      httpOnly: true, // Prevent JavaScript access to the cookie
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
  baseURL: process.env.BETTER_AUTH_URL!,
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
      redirectURI: "http://localhost:5000/api/auth/callback/google",
    },
    github: {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET as string,
      redirectURI: "http://localhost:5000/api/auth/callback/github",
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

            // Generate username from user's name (works for both email/password and social signin)
            let generatedOne = generateUsername(
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
          // Backup: if username is still NULL after creation, generate it
          if (!user.userName) {
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

            await prisma.user.update({
              where: { id: user.id },
              data: {
                userName: generatedOne,
                userName_lower: normalizeUsername(generatedOne),
              },
            });
          }
        },
      },
    },
  },
});
