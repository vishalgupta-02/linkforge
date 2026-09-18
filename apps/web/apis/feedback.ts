import axios from "axios";
import type { SubmitFeedbackParams, FeedbackCategory } from "@vyrex/types";

export type { SubmitFeedbackParams, FeedbackCategory };

export async function submitFeedback(params: SubmitFeedbackParams) {
  try {
    const rawBackendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

    const res = await axios.post(
      `${rawBackendUrl.trim().replace(/\/+$/, "")}/api/v1/feedback`,
      params,
      { withCredentials: true }
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to submit feedback. Please try again.";
      throw new Error(errorMessage);
    }
    throw error;
  }
}
