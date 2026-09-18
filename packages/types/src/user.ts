export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
}

export interface User {
  id: string;
  fullName: string | null;
  userName: string;
  email: string;
  image: string | null;
  plan: Plan | "FREE" | "PRO" | "BUSINESS";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileData {
  id: string;
  name?: string;
  userName: string;
  bio?: string | null;
  image?: string | null;
  email?: string | null;
  plan: "FREE" | "PRO" | "BUSINESS";
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
  statusCode: number;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  image?: string;
  theme?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name?: string;
    bio?: string;
    image?: string;
    theme?: string;
  };
}
