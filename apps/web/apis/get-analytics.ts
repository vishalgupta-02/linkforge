// apis/get-analytics.ts

import axios from "axios";

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
  percentage: number | 0;
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
  percentage: number | 0;
  relativeWidth: number | 0;
}

export interface LinkData {
  linkId: string;
  title: string;
  url: string;
  clicks: number;
  percentage: number | 0;
  relativeWidth: number | 0;
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
}

export type AnalyticsRange = "7d" | "30d" | "90d";

export async function getAnalytics(
  range: AnalyticsRange = "7d",
): Promise<AnalyticsResponse> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/dashboard?range=${range}`;

  const res = await axios.get(url, { withCredentials: true });

  if (!res.data) {
    throw new Error("Failed to fetch analytics");
  }

  // API returns { success, message, data: {...}, statusCode }
  const analyticsData = res.data.data !== undefined ? res.data.data : res.data;

  return analyticsData as AnalyticsResponse;
}

