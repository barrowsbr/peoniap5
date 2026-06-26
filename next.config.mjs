/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // yahoo-finance2 is a server-only dep; keep it out of the client bundle.
    serverComponentsExternalPackages: ["yahoo-finance2", "postgres"],
  },
};

export default nextConfig;
