/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Customize webpack config if necessary, such as handling CSS files
    return config;
  },

  images: {
    domains: ["cdn.sanity.io"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // For cPanel compatibility
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Use static export mode; note that custom rewrites are not supported with this setting.
  output: "export",

  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
