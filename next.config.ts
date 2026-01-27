import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactStrictMode: true,

  compiler: {
    emotion: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
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
