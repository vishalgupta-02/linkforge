import axios from "axios";

export interface CustomDomainItem {
  id: string;
  domainName: string;
  userId: string;
  verified: boolean;
  sslProvisioned: boolean;
  verifiedAt: string | null;
  sslProvisionedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainsResponse {
  domains: CustomDomainItem[];
  cnameTarget: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function getCustomDomains(): Promise<DomainsResponse> {
  const res = await axios.get(`${API_BASE}/api/v1/domains`, {
    withCredentials: true,
  });
  return res.data?.data || { domains: [], cnameTarget: "cname.linkforge.app" };
}

export async function addCustomDomain(domainName: string): Promise<{ domain: CustomDomainItem; cnameTarget: string }> {
  const res = await axios.post(
    `${API_BASE}/api/v1/domains`,
    { domainName },
    { withCredentials: true },
  );
  return res.data?.data;
}

export async function verifyCustomDomain(
  id: string,
  simulate?: boolean,
): Promise<{
  verified: boolean;
  domain: CustomDomainItem;
  expectedTarget: string;
  resolvedCnames: string[];
  message: string;
}> {
  const res = await axios.post(
    `${API_BASE}/api/v1/domains/${id}/verify${simulate ? "?simulate=true" : ""}`,
    { simulate },
    { withCredentials: true },
  );
  return res.data?.data;
}

export async function deleteCustomDomain(id: string): Promise<boolean> {
  const res = await axios.delete(`${API_BASE}/api/v1/domains/${id}`, {
    withCredentials: true,
  });
  return res.data?.success ?? true;
}
