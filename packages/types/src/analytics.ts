import { SocialMediaAnalytics } from "./social.ts";

export interface ClicksByDay {
  "7d"?: number;
  "30d"?: number;
  "90d"?: number;
}

export interface CountryData {
  country?: string;
  countryCode: string;
  flag: string;
  clicks: number;
  percentage: number;
  countryName: string;
  _count?: {
    countryCode?: number;
  };
}

export interface DeviceData {
  device: string;
  _count?: {
    device?: number;
  };
}

export interface SourceData {
  source: string;
  clicks: number;
  percentage: number;
  relativeWidth: number;
}

export interface LinkData {
  linkId: string;
  title: string;
  url: string;
  clicks: number;
  percentage: number;
  relativeWidth: number;
}

export interface AnalyticsResponse {
  totalClicks: number;
  clicksByDay: ClicksByDay;
  clicksByDayArray?: Array<{
    date: string;
    clicks: number;
  }>;
  clicksByCountry: CountryData[];
  clicksByDevice: DeviceData[];
  clicksByLink: LinkData[];
  clicksBySource: SourceData[];
  socialAnalytics?: SocialMediaAnalytics;
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors?: number;
  topCountry?: CountryData | null;
  topDevice?: DeviceData | null;
  topReferrer?: SourceData | null;
}
