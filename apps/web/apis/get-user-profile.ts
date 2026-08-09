// api/get-user-profile.ts

import axios from "axios";

export async function getMe(userId: string) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/user/me`,
      { userId },
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("User not found");
    }

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("User not found");
    }
    console.error("Failed to fetch public profile:", error);
    throw error;
  }
}
