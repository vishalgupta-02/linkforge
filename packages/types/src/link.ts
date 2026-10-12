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
  section?: LinkSection | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkSection {
  id: string;
  title: string;
  position: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  link?: Link[];
}

export interface PublicProfileLink {
  publicId: string;
  title: string;
  url: string;
  position: number;
  sectionId?: string | null;
}

export interface CreateLinkPayload {
  title: string;
  url: string;
  public?: boolean;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  sectionId?: string | null;
}

export interface UpdateLinkPayload {
  id: string;
  title?: string;
  url?: string;
  isActive?: boolean;
  public?: boolean;
  position?: number;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  sectionId?: string | null;
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
