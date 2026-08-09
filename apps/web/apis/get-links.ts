// apis/get-links.ts

import axios from "axios";

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

export async function getLinks(): Promise<Link[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/get-links`,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to fetch links");
    }

    // API returns { success, message, data: [], statusCode }
    // Extract data array from response
    let linksData: unknown = res.data;

    if (res.data.data !== undefined) {
      linksData = res.data.data;
    } else if (res.data.links !== undefined) {
      linksData = res.data.links;
    }

    if (!Array.isArray(linksData)) {
      console.warn(
        "Links response is not an array, returning empty array",
        res.data,
      );
      return [];
    }

    return linksData;
  } catch (error) {
    console.error("Failed to fetch links:", error);
    throw error;
  }
}
