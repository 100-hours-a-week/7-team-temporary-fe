import { expect, test, type Page } from "@playwright/test";

const USE_MOCKS = process.env.E2E_MOCKS === "1";
const LIVE_EMAIL = process.env.E2E_EMAIL;
const LIVE_PASSWORD = process.env.E2E_PASSWORD;
const HAS_LIVE_CREDS = Boolean(LIVE_EMAIL && LIVE_PASSWORD);

const SUCCESS_RESPONSE = (data: unknown) => ({
  status: "SUCCESS",
  message: "ok",
  data,
});

async function mockLoginSuccess(page: Page) {
  if (!USE_MOCKS) return;
  await page.route("**/token", async (route) => {
    const method = route.request().method();
    const data = method === "DELETE" ? null : { accessToken: "test-access-token" };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUCCESS_RESPONSE(data)),
    });
  });
}

async function mockLoginFailure(page: Page) {
  if (!USE_MOCKS) return;
  await page.route("**/token", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        code: "INVALID_REQUEST",
        message: "비밀번호가 올바르지 않습니다.",
      }),
    });
  });
}

async function mockHomeApis(page: Page) {
  if (!USE_MOCKS) return;
  const emptyDayPlan = {
    dayPlanId: 1,
    content: [],
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  };

  await page.route(/\/day-plan\/schedule(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUCCESS_RESPONSE(emptyDayPlan)),
    });
  });

  await page.route(/\/day-plan\/\d+\/schedule(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUCCESS_RESPONSE(emptyDayPlan)),
    });
  });

  await page.route(/\/day-plan\/\d+\/schedules(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUCCESS_RESPONSE({ ...emptyDayPlan, content: [] })),
    });
  });

  await page.route(/\/schedule$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SUCCESS_RESPONSE(null)),
    });
  });

  await page.route(/\/users$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        SUCCESS_RESPONSE({
          email: "tester@example.com",
          nickname: "테스터",
          gender: "MALE",
          birth: "2000-01-01",
          focusTimeZone: "MORNING",
          dayEndTime: "22:00",
          profileImage: null,
        }),
      ),
    });
  });
}

test.describe("P0 E2E", () => {
  test("E2E-01 비로그인 접근 시 로그인으로 리다이렉트", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("몰입이 시작되는")).toBeVisible();
  });

  test("E2E-02 로그인 실패 시 에러 표시", async ({ page }) => {
    test.skip(!USE_MOCKS && !HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
    await mockLoginFailure(page);
    await page.goto("/login");
    const email = USE_MOCKS ? "tester@example.com" : (LIVE_EMAIL as string);
    await page.getByPlaceholder("이메일을 입력해주세요").fill(email);
    await page.getByPlaceholder("비밀번호").fill("Valid1!aa");
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page.getByText("아이디나 비밀번호를 다시 확인해주세요.")).toBeVisible();
  });

  test("E2E-02 로그인 성공 -> 홈 진입 & 플래너 수정 진입", async ({ page }) => {
    test.skip(!USE_MOCKS && !HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
    await mockLoginSuccess(page);
    await mockHomeApis(page);

    await page.goto("/login");
    const email = USE_MOCKS ? "tester@example.com" : (LIVE_EMAIL as string);
    const password = USE_MOCKS ? "correct-password" : (LIVE_PASSWORD as string);
    await page.getByPlaceholder("이메일을 입력해주세요").fill(email);
    await page.getByPlaceholder("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    await page.waitForURL(/\/home/);
    await expect(page.getByText("지금 할 일")).toBeVisible();
    if (USE_MOCKS) {
      await expect(page.getByText("지금 할 일이 없습니다.")).toBeVisible();
      await expect(page.getByText("등록된 일정이 없습니다.")).toBeVisible();
    }

    await page.getByRole("button", { name: "플래너 수정" }).click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();
  });
});
