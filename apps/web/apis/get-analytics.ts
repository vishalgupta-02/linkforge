import axios from "axios";
import type {
  ClicksByDay,
  CountryData,
  DeviceData,
  SourceData,
  LinkData,
  AnalyticsResponse,
  SocialMediaAnalytics,
} from "@vyrex/types";

export type {
  ClicksByDay,
  CountryData,
  DeviceData,
  SourceData,
  LinkData,
  AnalyticsResponse,
};

export type AnalyticsRange = "7d" | "30d" | "90d";

export async function getAnalytics(
  range: AnalyticsRange = "7d",
): Promise<AnalyticsResponse> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/dashboard?range=${range}`;

  const res = await axios.get(url, { withCredentials: true });

  if (!res.data) {
    throw new Error("Failed to fetch analytics");
  }

  const analyticsData = res.data.data !== undefined ? res.data.data : res.data;

  return analyticsData as AnalyticsResponse;
}
