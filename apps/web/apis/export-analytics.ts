import axios from "axios";

export async function exportAnalyticsData(
  type: "clicks" | "links" = "clicks",
  format: "csv" | "json" = "csv",
) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const response = await axios.get(
    `${backendUrl}/api/v1/analytics/export?type=${type}&format=${format}`,
    {
      withCredentials: true,
      responseType: "blob",
    },
  );

  const mimeType =
    format === "json" ? "application/json" : "text/csv;charset=utf-8;";

  const blob = new Blob([response.data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `linkforge-${type}-${Date.now()}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
