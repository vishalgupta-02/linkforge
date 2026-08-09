// api/get-public-profile.ts

import axios from "axios";

export async function getPublicProfile(username: string) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/public/${username}`,
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
