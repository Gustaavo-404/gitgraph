import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    domains: ["avatars.githubusercontent.com"],
  },

  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
  ],
};

export default nextConfig;