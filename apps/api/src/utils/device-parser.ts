
import { UAParser } from "ua-parser-js";

export const parseUserAgent = (userAgent: string) => {
  const parser = new UAParser(userAgent);

  const deviceType = parser.getDevice().type;
  const browserName = parser.getBrowser().name;

  const country =
    process.env.NODE_ENV === "development" ? "IN" : browserName || "unknown";

  let device = "desktop";

  if (deviceType === "mobile") {
    device = "mobile";
  } else if (deviceType === "tablet") {
    device = "tablet";
  }

  return {
    device,
    browser: country, 
  };
};
