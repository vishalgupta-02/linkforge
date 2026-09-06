import axios from "axios";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export interface GenericAuthResponse {
  success: boolean;
  message: string;
  data: any;
  statusCode: number;
}

/**
 * Request a password reset email
 */
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

/**
 * Verifies if a reset token is valid and not expired
 */
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

/**
 * Resets the password using a valid token and new password
 */
export async function resetPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<GenericAuthResponse> {
  try {
    const res = await axios.post<GenericAuthResponse>(
      `${backendUrl}/api/v1/auth/reset-password`,
      payload,
      { withCredentials: true },
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to reset password",
      );
    }
    throw new Error(error.message || "Failed to reset password");
  }
}
