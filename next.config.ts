import type { NextConfig } from "next";
import path from "path";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, "package.json"), "utf-8")
) as { version?: string };
const appVersion = packageJson.version ?? "0.0.0";

// Projectroot: altijd deze map, ook als cwd elders is (bv. parent Documents)
const projectRoot = __dirname;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: projectRoot,
  // Turbopack: expliciete root zodat module-resolutie in deze map blijft (niet /Documents).
  turbopack: {
    root: projectRoot,
  },
  webpack: (config, { isServer }) => {
    // Module-resolutie altijd vanuit ToernooiProf, niet vanuit cwd (voorkomt /Documents/node_modules)
    config.context = projectRoot;
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
