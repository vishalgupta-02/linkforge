import axios from "axios";

export type UpdateLinkParams = {
  id: string;
  title?: string;
  url?: string;
  position?: number;
  public?: boolean;
  isActive?: boolean;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  sectionId?: string | null;
};

export async function updateLink({
  id,
  title,
  url,
  position,
  public: isPublic,
  isActive,
  scheduledStart,
  scheduledEnd,
  sectionId,
}: UpdateLinkParams) {
  try {
    const requestData: any = {};
    if (title !== undefined) requestData.title = title;
    if (url !== undefined) requestData.url = url;
    if (position !== undefined) requestData.position = position;
    if (isPublic !== undefined) requestData.public = isPublic;
    if (isActive !== undefined) requestData.isActive = isActive;
    if (scheduledStart !== undefined) requestData.scheduledStart = scheduledStart;
    if (scheduledEnd !== undefined) requestData.scheduledEnd = scheduledEnd;
    if (sectionId !== undefined) requestData.sectionId = sectionId;

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

export async function reorderLinksApi(linkIds: string[]) {
  try {
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/reorder`,
      { linkIds },
      { withCredentials: true },
    );
    return res.data;
  } catch (error) {
    console.error("Failed to reorder links:", error);
    throw error;
  }
}

// Section APIs
export interface SectionItem {
  id: string;
  title: string;
  position: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSectionsApi(): Promise<SectionItem[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/sections`,
      { withCredentials: true },
    );
    return res.data?.data || [];
  } catch (error) {
    console.error("Failed to get sections:", error);
    return [];
  }
}

export async function createSectionApi(title: string, position?: number): Promise<SectionItem> {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/sections`,
    { title, position },
    { withCredentials: true },
  );
  return res.data?.data;
}

export async function updateSectionApi(id: string, title?: string, position?: number): Promise<SectionItem> {
  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/sections/${id}`,
    { title, position },
    { withCredentials: true },
  );
  return res.data?.data;
}

export async function deleteSectionApi(id: string): Promise<boolean> {
  const res = await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/sections/${id}`,
    { withCredentials: true },
  );
  return res.data?.success ?? true;
}

export async function reorderSectionsApi(sectionIds: string[]): Promise<boolean> {
  const res = await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/links/sections/reorder`,
    { sectionIds },
    { withCredentials: true },
  );
  return res.data?.success ?? true;
}
