import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  compiler: {
    emotion: true,
    removeConsole: true,
  },

  webpack(config) {
    const excludeSvgFromRule = (rule: unknown) => {
      if (!rule || typeof rule !== "object") return;
      if ("test" in rule && (rule as { test?: RegExp }).test instanceof RegExp) {
        const test = (rule as { test?: RegExp }).test;
        if (test?.test(".svg")) {
          (rule as { exclude?: RegExp }).exclude = /\.svg$/i;
        }
      }
      if ("oneOf" in rule && Array.isArray((rule as { oneOf?: unknown[] }).oneOf)) {
        (rule as { oneOf?: unknown[] }).oneOf?.forEach((one) => excludeSvgFromRule(one));
      }
    };

    config.module.rules.forEach((rule: unknown) => excludeSvgFromRule(rule));

    config.module.rules.push({
      test: /\.svg$/i,
      type: "javascript/auto",
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "molip.s3.ap-northeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "hongik-univ-e0",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  sourcemaps: {
    disable: true,
    deleteSourcemapsAfterUpload: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
