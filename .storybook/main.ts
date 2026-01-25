import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-onboarding"],
  framework: "@storybook/nextjs",
  webpackFinal: async (config) => {
    // 기존 svg 로더 제거
    config.module?.rules?.forEach((rule: any) => {
      if (rule.test?.toString().includes("svg")) {
        rule.exclude = /\.svg$/;
      }
    });

    // SVGR 추가
    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
export default config;
