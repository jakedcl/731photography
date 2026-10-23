import type { NextConfig } from "next";

const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "g8r5pz57";
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/studio/:path*",
        destination: "/admin/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
      },
    ],
  },
};

export default nextConfig;
