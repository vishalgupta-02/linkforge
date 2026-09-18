export interface Link {
  id: string;
  publicId?: string | null;
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

export interface PublicProfileLink {
  publicId: string;
  title: string;
  url: string;
  position: number;
}

export interface CreateLinkPayload {
  title: string;
  url: string;
  public?: boolean;
}

export interface UpdateLinkPayload {
  id: string;
  title?: string;
  url?: string;
  isActive?: boolean;
  public?: boolean;
  position?: number;
}

export interface ReorderLinksPayload {
  linkIds: string[];
}

export interface GetLinksResponse {
  success: boolean;
  message: string;
  data: Link[];
  statusCode?: number;
}
