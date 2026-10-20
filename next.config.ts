import type { NextConfig } from "next";

// GitHub Pages: workflow base path'i verir (github.io'da "/afu-coming-soon", özel alan adında "")
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
