/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/chartTestPerfomance",
    assetPrefix: "/chartTestPerfomance/",
    output: "export",
    reactStrictMode: true,
    env: {
      NEXT_PUBLIC_BASE_PATH: "/chartTestPerfomance",
    },
  };
  
  module.exports = nextConfig;
  