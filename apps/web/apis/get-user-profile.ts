// api/get-user-profile.ts

import axios from "axios";

export interface UserProfileData {
  id: string;
  userName: string;
  plan: "FREE" | "PRO" | "BUSINESS";
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
  statusCode: number;
}

export async function getMe(
  userId: string,
): Promise<UserProfileResponse | null> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/user/me`,
      { userId },
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("User not found");
    }

    return res.data as UserProfileResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

