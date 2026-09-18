export type FeedbackCategory =
  | "general"
  | "bug"
  | "feature"
  | "billing"
  | "question"
  | "other";

export interface SubmitFeedbackParams {
  name?: string;
  email?: string;
  category?: FeedbackCategory;
  rating?: number;
  message: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    jobId?: string;
    deliveredTo?: string;
  };
}
