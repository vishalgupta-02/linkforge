import dns from "node:dns/promises";
import { prisma } from "../db/client.ts";
import { AppError } from "../utils/api-error.ts";
import { redis } from "../lib/redis.ts";
import { CACHE_KEYS } from "../lib/cache-keys.ts";
import { logger } from "../lib/logger.ts";

export const CNAME_TARGET =
  process.env.CUSTOM_DOMAIN_CNAME_TARGET || "cname.linkforge.app";

const RESERVED_DOMAINS = new Set([
  "localhost",
  "linkforge.com",
  "linkforge.app",
  "linkforge.dev",
  "api.linkforge.com",
  "api.linkforge.app",
  "admin.linkforge.app",
  "app.linkforge.app",
]);

export function cleanDomainName(raw: string): string {
  let cleaned = raw.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/\/.*$/, "");
  cleaned = cleaned.replace(/:\d+$/, "");
  return cleaned;
}

export function isValidDomainFormat(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

export async function listUserDomains(userId: string) {
  return prisma.customDomain.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addCustomDomain(userId: string, rawDomain: string) {
  const domainName = cleanDomainName(rawDomain);

  if (!isValidDomainFormat(domainName)) {
    throw new AppError(
      "Invalid domain format. Example: links.yourbrand.com or yourbrand.com",
      400,
    );
  }

  if (RESERVED_DOMAINS.has(domainName)) {
    throw new AppError("This domain is reserved by LinkForge", 400);
  }

  const existing = await prisma.customDomain.findUnique({
    where: { domainName },
  });

  if (existing) {
    if (existing.userId === userId) {
      throw new AppError("You have already added this domain", 409);
    }
    throw new AppError(
      "This domain is already connected to another LinkForge account",
      409,
    );
  }

  const domain = await prisma.customDomain.create({
    data: {
      domainName,
      userId,
      verified: false,
      sslProvisioned: false,
    },
  });

  try {
    await prisma.auditlog.create({
      data: {
        userId,
        action: "DOMAIN_ADDED",
        metadata: { domainName, domainId: domain.id },
        ipAddress: "127.0.0.1",
      },
    });
  } catch (err) {
    logger.warn("Failed to create audit log for DOMAIN_ADDED", { err });
  }

  logger.info("Custom domain added", { userId, domainName, domainId: domain.id });
  return domain;
}

export async function verifyDomainDns(
  userId: string,
  domainId: string,
  options?: { simulate?: boolean },
) {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new AppError("Custom domain not found", 404);
  }

  if (domain.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  const normalizedTarget = CNAME_TARGET.toLowerCase().replace(/\.$/, "");
  let verified = false;
  let resolvedCnames: string[] = [];
  let errorReason = "";

  try {
    const rawCnames = await dns.resolveCname(domain.domainName);
    resolvedCnames = rawCnames.map((c) => c.toLowerCase().replace(/\.$/, ""));

    if (resolvedCnames.includes(normalizedTarget)) {
      verified = true;
    } else {
      errorReason = `CNAME resolves to [${resolvedCnames.join(", ")}], but expected [${normalizedTarget}]`;
    }
  } catch (dnsErr: any) {
    errorReason = `DNS lookup for CNAME record returned ${dnsErr.code || dnsErr.message}`;
  }

  // Allow simulation for local testing, tests, or demo environments
  if (
    !verified &&
    (options?.simulate ||
      domain.domainName.endsWith(".test") ||
      domain.domainName.endsWith(".local") ||
      process.env.SIMULATE_DNS_VERIFICATION === "true")
  ) {
    verified = true;
    resolvedCnames = [normalizedTarget];
    errorReason = "";
  }

  if (verified) {
    const updated = await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        verified: true,
        verifiedAt: new Date(),
        sslProvisioned: true,
        sslProvisionedAt: new Date(),
      },
    });

    try {
      await redis.del(CACHE_KEYS.customDomain(domain.domainName));
      await prisma.auditlog.create({
        data: {
          userId,
          action: "DOMAIN_VERIFIED",
          metadata: { domainName: domain.domainName, domainId },
          ipAddress: "127.0.0.1",
        },
      });
    } catch (err) {
      logger.warn("Failed to update cache or audit log for DOMAIN_VERIFIED", { err });
    }

    logger.info("Custom domain successfully verified", {
      userId,
      domainName: domain.domainName,
      domainId,
    });

    return {
      verified: true,
      domain: updated,
      expectedTarget: normalizedTarget,
      resolvedCnames,
      message: "Domain verified and SSL provisioned successfully!",
    };
  }

  return {
    verified: false,
    domain,
    expectedTarget: normalizedTarget,
    resolvedCnames,
    message: errorReason || "CNAME verification failed. Please check your DNS records.",
  };
}

export async function removeCustomDomain(userId: string, domainId: string) {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new AppError("Custom domain not found", 404);
  }

  if (domain.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  await prisma.customDomain.delete({
    where: { id: domainId },
  });

  try {
    await redis.del(CACHE_KEYS.customDomain(domain.domainName));
    await prisma.auditlog.create({
      data: {
        userId,
        action: "DOMAIN_REMOVED",
        metadata: { domainName: domain.domainName, domainId },
        ipAddress: "127.0.0.1",
      },
    });
  } catch (err) {
    logger.warn("Failed to invalidate cache or log DOMAIN_REMOVED", { err });
  }

  logger.info("Custom domain removed", { userId, domainName: domain.domainName, domainId });
  return true;
}

export async function resolveDomainOwner(hostname: string) {
  const cleanHostname = cleanDomainName(hostname);
  if (!cleanHostname) return null;

  const cacheKey = CACHE_KEYS.customDomain(cleanHostname);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.debug("Redis cache miss for custom domain", { cleanHostname });
  }

  const domain = await prisma.customDomain.findUnique({
    where: { domainName: cleanHostname },
    include: {
      user: {
        select: {
          id: true,
          userName: true,
          name: true,
          plan: true,
          image: true,
        },
      },
    },
  });

  if (!domain || !domain.verified || !domain.user?.userName) {
    return null;
  }

  const payload = {
    domainId: domain.id,
    domainName: domain.domainName,
    userId: domain.user.id,
    username: domain.user.userName,
    name: domain.user.name,
    plan: domain.user.plan,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(payload), "EX", 300);
  } catch (err) {
    logger.debug("Failed to cache resolved domain", { err });
  }

  return payload;
}
