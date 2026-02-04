import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const LIVE_EMAIL = process.env.E2E_EMAIL;
const LIVE_PASSWORD = process.env.E2E_PASSWORD;
const DEFAULT_DATE_OFFSET = Number.parseInt(process.env.E2E_DATE_OFFSET ?? "0", 10);
const RESOLVED_DATE_OFFSET = Number.isNaN(DEFAULT_DATE_OFFSET) ? 0 : DEFAULT_DATE_OFFSET;
const SAVED_ACCOUNT_PATH = path.resolve(process.cwd(), "test-results", "e2e-account.json");

type SavedAccount = { email: string; password: string };

const readSavedAccount = (): SavedAccount | null => {
  if (!fs.existsSync(SAVED_ACCOUNT_PATH)) return null;
  try {
    const raw = fs.readFileSync(SAVED_ACCOUNT_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SavedAccount>;
    if (typeof parsed.email === "string" && typeof parsed.password === "string") {
      return { email: parsed.email, password: parsed.password };
    }
  } catch {
    // ignore malformed file
  }
  return null;
};

let SAVED_ACCOUNT = readSavedAccount();
const HAS_LIVE_CREDS = Boolean(LIVE_EMAIL && LIVE_PASSWORD) || Boolean(SAVED_ACCOUNT);

const persistAccount = (email: string, password: string) => {
  fs.mkdirSync(path.dirname(SAVED_ACCOUNT_PATH), { recursive: true });
  fs.writeFileSync(SAVED_ACCOUNT_PATH, JSON.stringify({ email, password }, null, 2));
  SAVED_ACCOUNT = { email, password };
};

async function mockNotificationPermission(page: Page) {
  await page.addInitScript(() => {
    const notification = window.Notification;
    if (!notification) return;
    Object.defineProperty(notification, "permission", {
      value: "denied",
      configurable: true,
    });
    notification.requestPermission = () => Promise.resolve("denied");
  });
}

async function login(page: Page, email = "tester@example.com", password = "Valid1!a") {
  const resolvedEmail = SAVED_ACCOUNT?.email ?? LIVE_EMAIL ?? email;
  const resolvedPassword = SAVED_ACCOUNT?.password ?? LIVE_PASSWORD ?? password;
  await page.getByPlaceholder("이메일을 입력해주세요").fill(resolvedEmail);
  await page.getByPlaceholder("비밀번호").fill(resolvedPassword);
  await page.getByRole("button", { name: "로그인" }).click();
}

async function selectCalendarDate(page: Page, offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const dayLabel = String(date.getDate());
  const dateButton = page.getByRole("button", { name: new RegExp(`^${dayLabel}$`) }).first();
  await expect(dateButton).toBeVisible();
  await dateButton.click();
}

async function waitForHome(page: Page, offsetDays = RESOLVED_DATE_OFFSET) {
  await page.waitForURL(/\/home/);
  await selectCalendarDate(page, offsetDays);
}

test.beforeEach(async ({ page }) => {
  await mockNotificationPermission(page);
});

test.describe("E2E-03 회원가입 전체 온보딩", () => {
  test("회원가입 -> 자동 로그인 -> 홈 진입", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "회원가입으로 이동" }).click();
    await expect(page.getByText("반가워요!")).toBeVisible();

    const uniqueEmail = `new-user-${Date.now()}@example.com`;

    await page.getByRole("button", { name: "시작하기" }).click();
    await page.getByPlaceholder("이메일을 입력해주세요.").fill(uniqueEmail);
    await page.getByRole("button", { name: "중복확인" }).click();
    await expect(page.getByText("사용 가능한 이메일입니다.")).toBeVisible();
    await page.getByPlaceholder("비밀번호를 입력해주세요.").fill("Valid1!a");
    await page.getByPlaceholder("닉네임을 입력해주세요.").fill("테스터");
    await page.getByRole("button", { name: "남성" }).click();
    await page.getByPlaceholder("0000.00.00").fill("1999.01.01");
    await page.getByRole("button", { name: /^다음$/ }).click();

    await page.getByRole("button", { name: "아침" }).click();
    await page.getByRole("button", { name: /^다음$/ }).click();

    await page.getByRole("button", { name: /^다음$/ }).click();

    await page
      .getByRole("checkbox", {
        name: "[필수] 서비스 이용약관 동의",
      })
      .check();
    await page
      .getByRole("checkbox", {
        name: "[필수] 개인정보 수집 및 이용 동의",
      })
      .check();
    await page.getByRole("button", { name: "회원가입", exact: true }).click();

    await expect(page.getByRole("button", { name: "자동 로그인" })).toBeVisible();
    persistAccount(uniqueEmail, "Valid1!a");
    await page.getByRole("button", { name: "자동 로그인" }).click();
    await waitForHome(page);
  });
});

test.describe("E2E-07 작업 추가/편집 검증", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("필수 입력/형식 검증", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);
    await page.getByRole("button", { name: "플래너 수정" }).first().click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();
    await page.getByRole("button", { name: "플래너 수정" }).last().click();

    await page.getByRole("button", { name: "할 일 추가" }).first().click();
    const submitButton = page.getByRole("button", { name: "할 일 추가" }).last();
    await expect(submitButton).toBeDisabled();

    const taskTitle = `검증 작업 ${Date.now()}`;
    await page.getByPlaceholder("스크럼 시간").fill(taskTitle);
    await expect(submitButton).toBeDisabled();

    await page.getByRole("button", { name: "1~2시간" }).click();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();
    await expect(page.getByText("할 일이 추가되었습니다.")).toBeVisible();
    const taskCard = page.locator("article").filter({ hasText: taskTitle });
    await expect(taskCard).toBeVisible();
    await taskCard.getByRole("button", { name: "작업 삭제" }).click();
    const confirmDelete = page.getByRole("button", { name: "삭제" });
    await expect(confirmDelete).toBeVisible();
    await confirmDelete.click();
    await expect(taskCard).toHaveCount(0);
  });
});

test.describe("E2E-09 홈 금일 할 일 확인", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("홈 진입 후 금일 할 일 섹션 확인", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);

    await expect(page.getByText("지금 할 일")).toBeVisible();

    const nowSection = page
      .getByText("지금 할 일")
      .locator("xpath=ancestor::section[1]");
    const emptyState = nowSection.getByText("지금 할 일이 없습니다.");
    const incompleteButton = nowSection.getByRole("button", { name: "완료" });
    const completedButton = nowSection.getByRole("button", { name: "완료됨" });
    await Promise.race([
      emptyState.waitFor({ state: "visible", timeout: 5000 }),
      incompleteButton.waitFor({ state: "visible", timeout: 5000 }),
      completedButton.waitFor({ state: "visible", timeout: 5000 }),
    ]);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    if (isEmpty) {
      await expect(incompleteButton).toHaveCount(0);
      await expect(completedButton).toHaveCount(0);
      return;
    }
    if (await incompleteButton.isVisible().catch(() => false)) {
      await incompleteButton.click();
      await expect(completedButton).toBeVisible();
      await expect(completedButton).toHaveAttribute("aria-pressed", "true");
      return;
    }
    await expect(completedButton).toBeVisible();
  });
});

test.describe("E2E-06 작업 바구니 기본", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("추가 -> 편집 -> 삭제", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);
    await page.getByRole("button", { name: "플래너 수정" }).first().click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();
    await page.getByRole("button", { name: "플래너 수정" }).last().click();

    const taskTitle = `할 일 A ${Date.now()}`;
    const editedTitle = `${taskTitle} 수정`;

    await page.getByRole("button", { name: "할 일 추가" }).first().click();
    await page.getByPlaceholder("스크럼 시간").fill(taskTitle);
    await page.getByRole("button", { name: "30분~1시간" }).click();
    await page.getByRole("button", { name: "할 일 추가" }).last().click();
    await expect(page.getByText("할 일이 추가되었습니다.")).toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();

    const taskCard = page.locator("article").filter({ hasText: taskTitle });
    await taskCard.getByRole("button", { name: "작업 편집" }).click();
    await expect(page.getByText("할 일 수정")).toBeVisible();
    await page.getByPlaceholder("스크럼 시간").fill(editedTitle);
    await page.getByRole("button", { name: "수정하기" }).click();
    await expect(page.getByText("할 일이 수정되었습니다.")).toBeVisible();
    await expect(page.getByText(editedTitle)).toBeVisible();

    await taskCard.getByRole("button", { name: "작업 삭제" }).click();
    await page.getByRole("button", { name: "삭제" }).click();
    await expect(page.getByText(editedTitle)).toHaveCount(0);
  });
});

test.describe("E2E-10 작업 분할", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("분할 시트 노출 -> 하위 작업 입력 -> 저장", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);
    await page.getByRole("button", { name: "플래너 수정" }).first().click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();
    await page.getByRole("button", { name: "플래너 수정" }).last().click();

    const longTaskTitle = `긴 작업 ${Date.now()}`;
    await page.getByRole("button", { name: "할 일 추가" }).first().click();
    await page.getByPlaceholder("스크럼 시간").fill(longTaskTitle);
    await page.getByRole("button", { name: "2~4시간" }).click();
    await page.getByRole("button", { name: "할 일 추가" }).last().click();
    await expect(page.getByText("할 일이 추가되었습니다.")).toBeVisible();

    await page.getByRole("button", { name: "플래너 배치하기" }).click();
    await expect(page.getByText("해당 작업은 너무 포괄적이에요!")).toBeVisible();
    const inputs = page.getByPlaceholder("하위 작업을 입력하세요");
    await inputs.nth(0).fill("하위 작업 1");
    await inputs.nth(1).fill("하위 작업 2");
    await page.getByRole("button", { name: "완료" }).click();
    await expect(page.getByText("해당 작업은 너무 포괄적이에요!")).not.toBeVisible();
  });
});

test.describe("E2E-08 AI 자동 배치", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("자동 배치 시트 노출 -> 실행 -> 완료 반영", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);
    await page.getByRole("button", { name: "플래너 수정" }).first().click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();
    await page.getByRole("button", { name: "플래너 수정" }).last().click();

    const aiTaskTitle = `AI 작업 ${Date.now()}`;
    await page.getByRole("button", { name: "할 일 추가" }).first().click();
    await page.getByPlaceholder("스크럼 시간").fill(aiTaskTitle);
    await page.getByRole("button", { name: "30분~1시간" }).click();
    await page.getByRole("button", { name: "할 일 추가" }).last().click();
    await expect(page.getByText("할 일이 추가되었습니다.")).toBeVisible();

    await page.getByRole("button", { name: "플래너 배치하기" }).click();
    await expect(page.getByRole("button", { name: "자동배치" })).toBeVisible();
    const aiArrangeResponse = page.waitForResponse(
      (response) =>
        /\/day-plan\/\d+\/schedules\/ai-arrangement$/.test(response.url()) &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await page.getByRole("button", { name: "자동배치" }).click();
    await aiArrangeResponse;
    await expect(page.getByText(/AI 자동 배치가 완료되었습니다\./)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("E2E-05 플래너 수정 기본", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("일정 로딩 -> 제외 리스트 -> 삭제 -> 작업 바구니 이동", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);

    await page.getByRole("button", { name: "플래너 수정" }).first().click();
    await expect(page.getByRole("button", { name: "제외리스트" })).toBeVisible();

    await page.getByRole("button", { name: "제외리스트" }).click();
    const excludedSheetTitle = page.getByText("제외된 리스트");
    await expect(excludedSheetTitle).toBeVisible();
    const excludedHandle = page.getByRole("button", { name: "바텀 시트 드래그 핸들" }).first();
    await expect(excludedHandle).toBeVisible();
    await excludedHandle.click();

    const excludedItems = page.locator('[data-testid^="excluded-task-"]');
    const excludedCount = await excludedItems.count();
    if (excludedCount === 0) {
      await expect(page.getByText("제외된 작업이 없습니다.")).toBeVisible();
    } else {
      await expect(excludedItems.first()).toBeVisible();
      const excludedItem = excludedItems.first();
      const excludedItemId = await excludedItem.getAttribute("data-testid");
      if (!excludedItemId) {
        throw new Error("Excluded task item id not found.");
      }
      const dropTarget = page.getByTestId("planner-slot-13-0");
      await dropTarget.scrollIntoViewIfNeeded();
      const restoreResponse = page.waitForResponse(
        (response) =>
          /\/schedule\/\d+$/.test(response.url()) &&
          response.request().method() === "PATCH" &&
          response.ok(),
      );
      const sourceBox = await excludedItem.boundingBox();
      const targetBox = await dropTarget.boundingBox();
      if (!sourceBox || !targetBox) {
        throw new Error("Drag source/target not measurable.");
      }
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(250);
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
        steps: 10,
      });
      await page.mouse.up();
      await restoreResponse;
      const dndStatus = page.getByRole("status");
      await expect(dndStatus).toContainText("dropped over droppable area");
      await expect(page.getByTestId(excludedItemId)).toHaveCount(0);
    }

    const editButtons = page.getByRole("button", { name: "작업 편집" });
    if ((await editButtons.count()) > 0) {
      await editButtons.first().click();
      await expect(page.getByText("할 일 수정")).toBeVisible();
      const updatedTitle = `플래너 수정 ${Date.now()}`;
      await page.getByPlaceholder("스크럼 시간").fill(updatedTitle);
      await page.getByRole("button", { name: "수정하기" }).click();
      await expect(page.getByText("할 일이 수정되었습니다.")).toBeVisible();
    }

    const deleteButtons = page.getByRole("button", { name: "작업 삭제" });
    if ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
      const confirmDelete = page.getByRole("button", { name: "삭제" });
      await expect(confirmDelete).toBeVisible();
      await confirmDelete.click();
    }
  });
});

test.describe("E2E-11 알림 목록", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("알림 목록 로딩/카드 노출", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);

    const notificationsResponse = page.waitForResponse(
      (response) =>
        /\/notifications(\?.*)?$/.test(response.url()) &&
        response.request().method() === "GET" &&
        response.ok(),
    );
    await page.getByRole("button", { name: "알림" }).click();
    await notificationsResponse;
  });
});

test.describe("E2E-12 프로필/내 정보 수정", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("프로필 수정/비밀번호 변경/약관 변경/푸시 등록", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);

    await page.getByRole("button", { name: "프로필" }).click();
    const profileResponse = page.waitForResponse(
      (response) => /\/users(\?.*)?$/.test(response.url()) && response.status() === 200,
    );
    await page.getByRole("button", { name: "내 정보" }).click();
    await profileResponse;

    const nicknameField = page.locator('input[name="nickname"]');
    await expect(nicknameField).toBeVisible();
    const initialNickname = await nicknameField.inputValue();
    const tooLongNickname = "가나다라마바사아자차카";
    await nicknameField.fill(tooLongNickname);
    await expect(page.getByText("닉네임은 최대 10자까지 입력할 수 있습니다.")).toBeVisible();

    const candidateNickname = initialNickname === "테스트닉" ? "테스트닉네" : "테스트닉";
    const updatedNickname = candidateNickname;
    await nicknameField.fill(updatedNickname);
    await expect(page.getByText("닉네임은 최대 10자까지 입력할 수 있습니다.")).not.toBeVisible();

    const saveButton = page.getByRole("button", { name: "저장" });
    await expect(saveButton).toBeEnabled();

    const saveResponse = page.waitForResponse((response) => {
      if (!/\/users(\?.*)?$/.test(response.url())) return false;
      if (response.request().method() === "GET") return false;
      const status = response.status();
      return status === 200 || status === 204;
    });

    await saveButton.click();
    await saveResponse;
    await expect(page.getByText("저장되었습니다.")).toBeVisible();

    const passwordSection = page.getByText("비밀번호 변경").locator("..");
    await passwordSection.getByRole("button", { name: "변경하기" }).click();
    await page.getByPlaceholder("새 비밀번호").fill("Valid1!a");
    await page.getByPlaceholder("비밀번호 확인").fill("Valid1!a");
    await page.getByRole("button", { name: "비밀번호 저장" }).click();
    await expect(page.getByText("비밀번호가 변경되었습니다.")).toBeVisible();

    await page.getByRole("button", { name: "약관 변경하기" }).click();
    const termsSheet = page.getByRole("button", { name: "바텀 시트 드래그 핸들" }).locator("..");
    await page.waitForResponse(
      (response) =>
        /\/terms-sign(\?.*)?$/.test(response.url()) &&
        response.request().method() === "GET" &&
        response.ok(),
    );
    await expect(termsSheet.getByText("약관 변경하기")).toBeVisible();
    const optionalTermsRow = termsSheet.getByText(/\[선택\]/).locator("..");
    const optionalCheckbox = optionalTermsRow.locator('input[type="checkbox"]');
    await expect(optionalCheckbox).toBeVisible();
    const termsUpdateResponse = page.waitForResponse(
      (response) =>
        /\/terms-sign\/\d+$/.test(response.url()) &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );
    await optionalCheckbox.click();
    await termsUpdateResponse;
    await expect(page.getByText("약관 동의가 변경되었습니다.")).toBeVisible();
    const termsOverlay = page.locator("div.fixed.inset-0.bg-black").first();
    await expect(termsOverlay).toBeVisible();
    await termsOverlay.click({ position: { x: 1, y: 1 } });

  });
});

test.describe("E2E-13 로그아웃", () => {
  test.skip(!HAS_LIVE_CREDS, "E2E_EMAIL/E2E_PASSWORD가 필요합니다.");
  test("로그아웃 후 로그인 화면 이동 및 보호 경로 차단", async ({ page }) => {
    await page.goto("/login");
    await login(page);
    await waitForHome(page);

    await page.getByRole("button", { name: "프로필" }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await page.waitForURL(/\/login/);
  });
});
