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

export interface BillingPortalResponse {
  url: string;
  success?: boolean;
}

export interface CreateCheckoutPayload {
  priceId?: string;
  plan?: "PRO" | "BUSINESS";
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  url: string;
  sessionId?: string;
}
