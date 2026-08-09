// lib/create-links.ts

import axios from "axios";

type CreateLinkParams = {
  url: string;
  title: string;
  position: number;
  public: boolean;
};

export async function createLinks({
  url,
  title,
  position,
  public: isPublic,
}: CreateLinkParams) {
  try {
    const requestData = {
      url: url,
      title: title,
      position: position,
      public: isPublic,
    };

    console.log("Creating link with data:", requestData);

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/create`,
      requestData,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to create link");
    }

    // Extract link data from response
    const linkData = res.data.data || res.data;
    console.log("Link created successfully:", linkData);

    return linkData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);

      if (error.response?.status === 404) {
        throw new Error("Link not found");
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Invalid request";
        throw new Error(`Bad Request: ${errorMessage}`);
      }
    }
    console.error("Failed to create link:", error);
    throw error;
  }
}
