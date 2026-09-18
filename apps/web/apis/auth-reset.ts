import axios from "axios";
import type { GenericAuthResponse, ResetPasswordPayload } from "@vyrex/types";

export type { GenericAuthResponse };

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function requestForgotPassword(
  email: string,
): Promise<GenericAuthResponse> {
  try {
    const res = await axios.post<GenericAuthResponse>(
      `${backendUrl}/api/v1/auth/forgot-password`,
      { email },
      { withCredentials: true },
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as GenericAuthResponse;
    }
    throw new Error(error.message || "Failed to request password reset");
  }
}

export async function verifyResetPasswordToken(
  token: string,
): Promise<{ valid: boolean; message?: string }> {
  try {
    const res = await axios.get<GenericAuthResponse>(
      `${backendUrl}/api/v1/auth/reset-password/verify`,
      {
        params: { token },
        withCredentials: true,
      },
    );
    return { valid: res.data?.success ?? true };
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "This password reset link is invalid or has expired.";
    return { valid: false, message };
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<GenericAuthResponse> {
  try {
    const res = await axios.post<GenericAuthResponse>(
      `${backendUrl}/api/v1/auth/reset-password`,
      payload,
      { withCredentials: true },
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as GenericAuthResponse;
    }
    throw new Error(error.message || "Failed to reset password");
  }
}
