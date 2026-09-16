import axios from "axios";
import type { SocialLink } from "@vyrex/types";

export type { SocialLink };

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/socials`,
      { withCredentials: true },
    );

    let socialsData: unknown = res.data;
    if (res.data?.data !== undefined) {
      socialsData = res.data.data;
    }

    if (!Array.isArray(socialsData)) {
      return [];
    }

    return socialsData as SocialLink[];
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return [];
  }
}

export async function createSocialLink(data: {
  platform: string;
  url: string;
  position?: number;
  isActive?: boolean;
}): Promise<SocialLink | null> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/socials`,
      data,
      { withCredentials: true },
    );
    return res.data?.data || null;
  } catch (error) {
    console.error("Failed to create social link:", error);
    throw error;
  }
}

export async function updateSocialLink(data: {
  id: string;
  platform?: string;
  url?: string;
  position?: number;
  isActive?: boolean;
}): Promise<SocialLink | null> {
  try {
    const { id, ...updateData } = data;
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/socials/${id}`,
      updateData,
      { withCredentials: true },
    );
    return res.data?.data || null;
  } catch (error) {
    console.error(`Failed to update social link ${data.id}:`, error);
    throw error;
  }
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/socials/${id}`,
      { withCredentials: true },
    );
    return true;
  } catch (error) {
    console.error(`Failed to delete social link ${id}:`, error);
    throw error;
  }
}

export async function reorderSocialLinksApi(socialIds: string[]): Promise<boolean> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/socials/reorder`,
      { socialIds },
      { withCredentials: true },
    );
    return true;
  } catch (error) {
    console.error("Failed to reorder social links:", error);
    throw error;
  }
}
