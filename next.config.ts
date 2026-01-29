import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  compiler: {
    emotion: true,
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

export default nextConfig;
