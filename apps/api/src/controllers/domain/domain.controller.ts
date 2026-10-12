import type { Request, Response } from "express";
import { z } from "zod";
import {
  addCustomDomain,
  listUserDomains,
  removeCustomDomain,
  resolveDomainOwner,
  verifyDomainDns,
  CNAME_TARGET,
} from "../../services/domain.service.ts";
import { AppError } from "../../utils/api-error.ts";
import { ApiResponse } from "../../utils/api-response.ts";

const addDomainSchema = z.object({
  domainName: z.string().min(3).max(253),
});

export const getDomainsController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const domains = await listUserDomains(userId);
  return res.status(200).json(
    ApiResponse(
      {
        domains,
        cnameTarget: CNAME_TARGET,
      },
      "Domains fetched successfully",
      200,
    ),
  );
};

export const addDomainController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = addDomainSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid domain name",
      400,
    );
  }

  const domain = await addCustomDomain(userId, parsed.data.domainName);
  return res.status(201).json(
    ApiResponse(
      {
        domain,
        cnameTarget: CNAME_TARGET,
      },
      "Domain added successfully. Please configure your DNS CNAME record.",
      201,
    ),
  );
};

export const verifyDomainController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!id) throw new AppError("Domain ID is required", 400);

  const simulate = req.query.simulate === "true" || req.body?.simulate === true;
  const result = await verifyDomainDns(userId, id, { simulate });

  return res.status(200).json(
    ApiResponse(
      result,
      result.verified
        ? "Domain DNS verified successfully"
        : "Domain DNS verification failed",
      200,
    ),
  );
};

export const deleteDomainController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!id) throw new AppError("Domain ID is required", 400);

  await removeCustomDomain(userId, id);
  return res.status(200).json(
    ApiResponse(null, "Domain removed successfully", 200),
  );
};

export const resolveDomainController = async (req: Request, res: Response) => {
  const rawParam = req.params.hostname;
  const hostnameParam = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const rawHostname = hostnameParam || (typeof req.query.hostname === "string" ? req.query.hostname : undefined);
  if (!rawHostname) {
    throw new AppError("Hostname is required", 400);
  }

  const resolved = await resolveDomainOwner(rawHostname);
  if (!resolved) {
    return res.status(404).json({
      success: false,
      message: "Custom domain not found or not verified",
    });
  }

  return res.status(200).json(
    ApiResponse(resolved, "Domain resolved successfully", 200),
  );
};
