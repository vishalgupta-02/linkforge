// apis/update-link.ts

import axios from "axios";

type UpdateLinkParams = {
  id: string;
  title?: string;
  url?: string;
  position?: number;
  public?: boolean;
  isActive?: boolean;
};

export async function updateLink({
  id,
  title,
  url,
  position,
  public: isPublic,
  isActive,
}: UpdateLinkParams) {
  try {
    const requestData: any = {};
    if (title !== undefined) requestData.title = title;
    if (url !== undefined) requestData.url = url;
    if (position !== undefined) requestData.position = position;
    if (isPublic !== undefined) requestData.public = isPublic;
    if (isActive !== undefined) requestData.isActive = isActive;

    console.log(`Updating link ${id} with data:`, requestData);
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/update/${id}`,
      requestData,
      { withCredentials: true },
    );

    if (!res.data) {
      throw new Error("Failed to update link");
    }

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Link not found");
    }
    console.error(`Failed to update link ${id}:`, error);
    throw error;
  }
}
