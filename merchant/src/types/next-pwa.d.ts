declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCachingEntry {
    urlPattern: RegExp | ((params: { url: URL }) => boolean);
    handler:
      | "CacheFirst"
      | "CacheOnly"
      | "NetworkFirst"
      | "NetworkOnly"
      | "StaleWhileRevalidate";
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      networkTimeoutSeconds?: number;
      cacheableResponse?: {
        statuses?: number[];
      };
    };
  }

  interface PWAConfig {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCachingEntry[];
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
