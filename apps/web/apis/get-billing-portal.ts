// apis/get-billing-portal.ts
import axios from "axios";

export interface BillingPortalResponse {
  url: string;
}

export async function getBillingPortalSession(): Promise<BillingPortalResponse> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/portal`,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to create billing portal session");
    }

    const data = res.data.data !== undefined ? res.data.data : res.data;
    return data as BillingPortalResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Failed to open billing portal";
      throw new Error(message);
    }
    throw error;
  }
}
