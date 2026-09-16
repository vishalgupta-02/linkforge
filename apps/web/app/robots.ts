import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    "https://linkforge.bio";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/username/"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/onboarding",
          "/onboarding/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
