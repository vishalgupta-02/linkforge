export interface User {
  id: string;
  fullName: string | null;
  userName: string;
  email: string;
  image: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  position: number;
  counts: number;
  public: boolean;
  isActive: boolean;
  deletedAt: string | null;
  userId: string;
  sectionId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
}
