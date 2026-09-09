import type { NextConfig } from "next";

/**
 * Hosts allowed to load the dev server's internal assets (HMR, `/_next/*`).
 * Next 16 blocks these cross-origin by default, so hitting the dev server from
 * another machine on the LAN (e.g. `http://192.168.1.50:3000`) shows a blank
 * page until the origin is listed here.
 *
 * Override / extend with `NEXT_DEV_ORIGINS=host1,host2` (comma-separated).
 * Dev-only — has no effect on `next build` / `next start`.
 */
const devOrigins = [
  "192.168.*.*",
  "10.*.*.*",
  "172.16.*.*",
  "172.17.*.*",
  "172.18.*.*",
  "172.19.*.*",
  "172.20.*.*",
  "172.21.*.*",
  ...(process.env.NEXT_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
