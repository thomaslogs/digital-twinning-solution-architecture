/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  reactStrictMode: true,
  // Prevent `next build` from invalidating a running `next dev` cache/artifacts.
  distDir: isDev ? ".next-dev" : ".next"
};

export default nextConfig;
