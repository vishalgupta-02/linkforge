export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "x"
  | "youtube"
  | "linkedin"
  | "github"
  | "tiktok"
  | "twitch"
  | "discord"
  | "spotify"
  | "facebook"
  | "threads"
  | "telegram"
  | "pinterest"
  | "snapchat"
  | "patreon"
  | "substack"
  | "medium"
  | "whatsapp"
  | "custom"
  | string;

export interface SocialLink {
  id: string;
  publicId?: string | null;
  platform: string;
  url: string;
  position: number;
  counts: number;
  isActive: boolean;
  deletedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileSocial {
  id?: string;
  publicId: string;
  platform: string;
  url: string;
  position: number;
  counts?: number;
}

export interface SocialClickItem {
  socialLinkId: string;
  platform: string;
  url: string;
  clicks: number;
  percentage: number;
  relativeWidth: number;
}

export interface SocialMediaAnalytics {
  totalSocialClicks: number;
  topSocial: SocialClickItem | null;
  clicksBySocial: SocialClickItem[];
}

export interface AddSocialLinkPayload {
  platform: string;
  url: string;
}

export interface UpdateSocialLinkPayload {
  platform?: string;
  url?: string;
  isActive?: boolean;
}

export interface ReorderSocialLinksPayload {
  items: { id: string; position: number }[];
}
