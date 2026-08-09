// apis/delete-link.ts

import axios from "axios";

export async function deleteLink(linkId: string): Promise<void> {
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/delete/${linkId}`,
      { withCredentials: true },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Link not found");
    }
    console.error(`Failed to delete link ${linkId}:`, error);
    throw error;
  }
}
