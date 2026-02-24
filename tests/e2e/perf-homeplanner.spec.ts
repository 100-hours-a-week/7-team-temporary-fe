import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = process.env.PERF_OUTPUT_DIR ?? "tmp/planner";
const PERF_LABEL = process.env.PERF_LABEL ?? "homeplanner-perf";
const PERF_PROFILER_ID = process.env.PERF_REACT_ID ?? "HomePlanner";
const PERF_RECORD_MS = Number.parseInt(process.env.PERF_RECORD_MS ?? "3000", 10);
const PERF_STEP_DELAY_MS = Number.parseInt(process.env.PERF_STEP_DELAY_MS ?? "700", 10);
const PERF_RUNS = Number.parseInt(process.env.PERF_RUNS ?? "1", 10);
const PERF_WAIT_TIMEOUT_MS = Number.parseInt(process.env.PERF_WAIT_TIMEOUT_MS ?? "15000", 10);

const PROFILE_LOGIN_EMAIL = process.env.PROFILE_LOGIN_EMAIL;
const PROFILE_LOGIN_PASSWORD = process.env.PROFILE_LOGIN_PASSWORD;
const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

const LOGIN_EMAIL = PROFILE_LOGIN_EMAIL ?? E2E_EMAIL;
const LOGIN_PASSWORD = PROFILE_LOGIN_PASSWORD ?? E2E_PASSWORD;
const HAS_LOGIN_CREDS = Boolean(LOGIN_EMAIL && LOGIN_PASSWORD);

type ProfilerEntry = {
  id: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
};

type Artifact = {
  run: number;
  harPath: string;
  profilerPath: string;
};

const runArtifacts: Artifact[] = [];
const PERF_DATE_STEPS: Array<{ iso: string; day: number; monthDay: string }> = [
  { iso: "2026-02-09", day: 9, monthDay: "02.09" },
  { iso: "2026-02-10", day: 10, monthDay: "02.10" },
  { iso: "2026-02-09", day: 9, monthDay: "02.09" },
  { iso: "2026-02-10", day: 10, monthDay: "02.10" },
  { iso: "2026-02-09", day: 9, monthDay: "02.09" },
];

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function sanitize(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function mockNotificationPermission(page: Page) {
  await page.addInitScript(() => {
    (window as any).__MOLIP_PROFILE_CAPTURE__ = true;
    (window as any).__MOLIP_PROFILE_ENTRIES__ = [];

    const notification = window.Notification;
    if (!notification) return;
    Object.defineProperty(notification, "permission", {
      value: "denied",
      configurable: true,
    });
    notification.requestPermission = () => Promise.resolve("denied");
  });
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("이메일을 입력해주세요").fill(email);
  await page.getByPlaceholder("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();

  try {
    await page.waitForURL(/\/home/, { timeout: 15_000 });
  } catch {
    const alertText = await page
      .locator("[role='alert']")
      .first()
      .textContent()
      .catch(() => null);
    const suffix = alertText ? ` alert="${alertText.trim()}"` : "";
    throw new Error(`Login did not reach /home. current="${page.url()}"${suffix}`);
  }
}

function assertNotLoginPage(page: Page) {
  if (page.url().includes("/login")) {
    throw new Error(`Unexpected redirect to /login during perf scenario. current="${page.url()}"`);
  }
}

async function waitForHomeSettled(page: Page, timeoutMs = PERF_WAIT_TIMEOUT_MS) {
  await page.waitForURL(/\/home/, { timeout: timeoutMs });
  assertNotLoginPage(page);

  await expect(page.getByRole("button", { name: "이전 주" })).toBeVisible({ timeout: timeoutMs });
  await expect(page.getByRole("button", { name: "다음 주" })).toBeVisible({ timeout: timeoutMs });

  await expect
    .poll(
      async () => {
        const pulseCount = await page.locator(".animate-pulse:visible").count();
        const loadingCount = await page.getByText("불러오는 중...").locator(":visible").count();
        return pulseCount + loadingCount;
      },
      {
        timeout: timeoutMs,
        message: "Home loading indicators should be gone",
      },
    )
    .toBe(0);

  try {
    await page.waitForLoadState("networkidle", { timeout: Math.min(5000, timeoutMs) });
  } catch {
    // Ongoing polling can prevent strict networkidle completion.
  }
}

async function clickDateButtonWithWeekFallback(
  page: Page,
  day: number,
) {
  const findInCurrentWeek = async () => {
    const dayPattern = new RegExp(`^\\s*${day}\\s*$`);
    const button = page.locator("button:visible").filter({ hasText: dayPattern }).first();
    if ((await button.count()) === 0) return null;
    return button;
  };

  const clickIfPresent = async () => {
    const button = await findInCurrentWeek();
    if (!button) return false;
    await expect(button).toBeVisible();
    await button.click();
    return true;
  };

  if (await clickIfPresent()) return;

  const prevWeekButton = page.getByRole("button", { name: "이전 주" });
  const nextWeekButton = page.getByRole("button", { name: "다음 주" });

  for (let attempt = 0; attempt < 6; attempt += 1) {
    await prevWeekButton.click();
    if (await clickIfPresent()) return;
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    await nextWeekButton.click();
    if (await clickIfPresent()) return;
  }

  throw new Error(`Could not find day button "${day}" after navigating weeks.`);
}

async function clickAndWait(
  page: Page,
  action: () => Promise<void>,
  stepName: string,
  stepDelayMs: number,
) {
  console.log(`[perf] step: ${stepName}`);
  const dayPlanResponsePromise = page
    .waitForResponse((response) => {
      try {
        const url = new URL(response.url());
        return response.request().method() === "GET" && url.pathname === "/api/day-plan/schedule";
      } catch {
        return false;
      }
    }, { timeout: 7000 })
    .catch(() => null);

  await action();
  await dayPlanResponsePromise;
  await waitForHomeSettled(page);

  if (stepDelayMs > 0) {
    await page.waitForTimeout(stepDelayMs);
  }
}

async function runHomeScenario(page: Page, stepDelayMs: number) {
  await waitForHomeSettled(page);

  console.log("[perf] step: 홈 조회");
  const homeLink = page.getByRole("link", { name: /^홈$/ }).first();
  if ((await homeLink.count()) > 0) {
    await homeLink.click();
  } else {
    const homeButton = page.getByRole("button", { name: /^홈$/ }).first();
    if ((await homeButton.count()) > 0) {
      await homeButton.click();
    }
  }
  await waitForHomeSettled(page);

  const nextWeekButton = page.getByRole("button", { name: "다음 주" });
  const prevWeekButton = page.getByRole("button", { name: "이전 주" });

  await clickAndWait(page, () => nextWeekButton.click(), "주간 플랜 이동 next #1", stepDelayMs);
  await clickAndWait(page, () => nextWeekButton.click(), "주간 플랜 이동 next #2", stepDelayMs);
  await clickAndWait(page, () => prevWeekButton.click(), "주간 플랜 이동 prev #1", stepDelayMs);
  await clickAndWait(page, () => prevWeekButton.click(), "주간 플랜 이동 prev #2", stepDelayMs);

  for (let index = 0; index < PERF_DATE_STEPS.length; index += 1) {
    const step = PERF_DATE_STEPS[index];
    await clickAndWait(
      page,
      () => clickDateButtonWithWeekFallback(page, step.day),
      `${step.iso} 확인`,
      stepDelayMs,
    );
    await expect(page.getByText(new RegExp(`${step.monthDay}\\s*\\(`))).toBeVisible({
      timeout: PERF_WAIT_TIMEOUT_MS,
    });
  }
}

function toProfilerPayload(entries: ProfilerEntry[], runNo: number, url: string) {
  const commitData = entries
    .filter((entry) => entry.id === PERF_PROFILER_ID)
    .map((entry) => ({
      duration: entry.actualDuration,
      effectDuration: 0,
      passiveEffectDuration: 0,
      priorityLevel: "Normal",
      timestamp: entry.commitTime,
      updaters: [{ displayName: entry.id }],
      phase: entry.phase,
      baseDuration: entry.baseDuration,
      startTime: entry.startTime,
    }));

  return {
    version: 5,
    codexMeta: {
      source: "react-profiler-console",
      url,
      label: PERF_LABEL,
      run: runNo,
      reactProfilerId: PERF_PROFILER_ID,
      generatedAt: new Date().toISOString(),
    },
    dataForRoots: [{ displayName: PERF_PROFILER_ID, commitData }],
  };
}

const totalRuns = Number.isFinite(PERF_RUNS) && PERF_RUNS > 0 ? PERF_RUNS : 1;
const normalizedRecordMs = Number.isFinite(PERF_RECORD_MS) && PERF_RECORD_MS >= 0 ? PERF_RECORD_MS : 3000;
const normalizedStepDelayMs =
  Number.isFinite(PERF_STEP_DELAY_MS) && PERF_STEP_DELAY_MS >= 0 ? PERF_STEP_DELAY_MS : 700;

test.describe.serial("PERF HomePlanner", () => {
  test.skip(!HAS_LOGIN_CREDS, "PROFILE_LOGIN_EMAIL/PASSWORD 또는 E2E_EMAIL/PASSWORD가 필요합니다.");

  for (let runNo = 1; runNo <= totalRuns; runNo += 1) {
    test(`run #${runNo} (${PERF_LABEL})`, async ({ browser }) => {
      const baseName = `${timestamp()}-${sanitize(PERF_LABEL)}-r${runNo}`;
      ensureDir(path.resolve(process.cwd(), OUTPUT_DIR));

      const harPath = path.resolve(process.cwd(), OUTPUT_DIR, `network-${baseName}.har`);
      const profilerPath = path.resolve(
        process.cwd(),
        OUTPUT_DIR,
        `profiling-data.${baseName}.json`,
      );

      const context = await browser.newContext({
        baseURL: BASE_URL,
        recordHar: {
          path: harPath,
          mode: "full",
          content: "embed",
        },
      });

      try {
        const page = await context.newPage();

        await mockNotificationPermission(page);

        await login(page, LOGIN_EMAIL as string, LOGIN_PASSWORD as string);
        await runHomeScenario(page, normalizedStepDelayMs);

        if (normalizedRecordMs > 0) {
          await page.waitForTimeout(normalizedRecordMs);
        }

        const profilerEntries = await page.evaluate(() => {
          const raw = (window as any).__MOLIP_PROFILE_ENTRIES__;
          return Array.isArray(raw) ? raw : [];
        });
        if (profilerEntries.length === 0) {
          throw new Error(
            "No React profiler entries captured. Check that HomePlanner Profiler is mounted and scenario reached /home.",
          );
        }

        const payload = toProfilerPayload(profilerEntries, runNo, new URL("/home", BASE_URL).toString());
        fs.writeFileSync(profilerPath, JSON.stringify(payload, null, 2));

        runArtifacts.push({
          run: runNo,
          harPath,
          profilerPath,
        });
      } finally {
        await context.close();
      }
    });
  }

  test.afterAll(async () => {
    if (runArtifacts.length === 0) return;

    const manifestPath = path.resolve(
      process.cwd(),
      OUTPUT_DIR,
      `profile-manifest-${timestamp()}-${sanitize(PERF_LABEL)}.json`,
    );
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl: BASE_URL,
          scenario: {
            weekMoves: ["next", "next", "prev", "prev"],
            dateChecks: PERF_DATE_STEPS,
          },
          runs: runArtifacts,
        },
        null,
        2,
      ),
    );
  });
});
