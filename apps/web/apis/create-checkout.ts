// apis/create-checkout.ts
import axios from "axios";

export interface CheckoutResponse {
  url: string;
}

export async function createCheckoutSession(): Promise<CheckoutResponse> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/billing/checkout`,
      {},
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to create checkout session");
    }

    const data = res.data.data !== undefined ? res.data.data : res.data;
    return data as CheckoutResponse;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "Failed to create checkout session";
      throw new Error(message);
    }
    throw error;
  }
}
