/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/chartTestPerfomance",
  output: "export",  // <=== enables static exports
  reactStrictMode: true,
};

module.exports = nextConfig;