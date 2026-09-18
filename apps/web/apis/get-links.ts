import axios from "axios";
import type { Link, GetLinksResponse } from "@vyrex/types";

export type { Link, GetLinksResponse };

export async function getLinks(): Promise<Link[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/get-links`,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to fetch links");
    }

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
