import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config();

const isCI = !!process.env.CI;
const localWorkers = 1;
const resolvedWorkers = isCI ? 1 : localWorkers;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  workers: resolvedWorkers,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
