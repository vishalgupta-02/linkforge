// import type { NextConfig } from "next";
// import path from "path";

// const backendUrl =
//   process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

// if (!backendUrl) {
//   throw new Error(
//     "BACKEND_INTERNAL_URL or NEXT_PUBLIC_BACKEND_URL must be configured",
//   );
// }

// const nextConfig: NextConfig = {
//   output: "standalone",
//   outputFileTracingRoot: path.join(__dirname, "../../"),

//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "images.unsplash.com",
//       },
//     ],
//   },

//   async rewrites() {
//     return [
//       {
//         source: "/api/auth/:path*",
//         destination: `${backendUrl.replace(/\/$/, "")}/api/auth/:path*`,
//       },
//     ];
//   },
// };

// export default nextConfig;

//! ----------------------------------------------------------------------------

import type { NextConfig } from "next";
import path from "path";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    "BACKEND_INTERNAL_URL or NEXT_PUBLIC_BACKEND_URL must be configured",
  );
}

if (!/^https?:\/\//.test(backendUrl)) {
  throw new Error(
    `Invalid backend URL: "${backendUrl}". It must start with http:// or https://`,
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
