// apis/get-billing-status.ts
import axios from "axios";

export interface BillingStatusData {
  plan: "FREE" | "PRO" | "BUSINESS";
  subscriptionStatus: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  hasBillingAccount: boolean;
}

export interface BillingStatusResponse {
  success: boolean;
  message: string;
  data: BillingStatusData;
  statusCode: number;
}

export async function getBillingStatus(): Promise<BillingStatusResponse> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/status`,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to retrieve billing status");
    }

    return res.data as BillingStatusResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Failed to retrieve billing status";
      throw new Error(message);
    }
    throw error;
  }
}
