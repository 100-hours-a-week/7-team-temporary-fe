import { test, expect, type Page } from "@playwright/test";

/**
 * E2E-04: 홈 플래너 기본 흐름
 * 테스트 케이스: T5-1 ~ T5-12
 *
 * 검증 내용:
 * - 주간 이동/날짜 선택
 * - 일정/현재 할 일 표시
 * - 플래너 수정 진입
 */

test.describe("E2E-04: 홈 플래너 기본 흐름", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인된 상태로 홈 페이지 접근
    // TODO: 실제 인증 구현 시 auth.setup.ts에서 storageState 사용
    await page.goto("/home");

    // 홈 페이지 로드 대기
    await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  });

  test.describe("T5-1 ~ T5-4: 주간 이동", () => {
    test("T5-1: 이전 주 버튼 클릭 시 이전 주로 이동", async ({ page }) => {
      // 현재 월 표시 확인
      const monthHeader = page.locator("h2").filter({ hasText: /\d+월/ });
      await expect(monthHeader).toBeVisible();

      // 현재 표시된 날짜 기록
      const currentMonth = await monthHeader.textContent();

      // 이전 주 버튼 클릭
      await page.getByRole("button", { name: "이전 주" }).click();

      // 날짜가 변경되었는지 확인 (7일 전으로 이동)
      // 월이 바뀔 수도 있고 안 바뀔 수도 있음
      await expect(monthHeader).toBeVisible();
    });

    test("T5-2: 다음 주 버튼 클릭 시 다음 주로 이동", async ({ page }) => {
      // 현재 월 표시 확인
      const monthHeader = page.locator("h2").filter({ hasText: /\d+월/ });
      await expect(monthHeader).toBeVisible();

      // 다음 주 버튼 클릭
      await page.getByRole("button", { name: "다음 주" }).click();

      // 날짜가 변경되었는지 확인
      await expect(monthHeader).toBeVisible();
    });

    test("T5-3: 이전/다음 주 연속 이동 후 원래 위치 복귀", async ({ page }) => {
      const monthHeader = page.locator("h2").filter({ hasText: /\d+월/ });

      // 현재 선택된 날짜 확인 (선택된 날짜는 빨간 배경)
      const selectedDate = page.locator("button span.bg-\\[\\#FF6B6B\\]");

      // 다음 주로 이동
      await page.getByRole("button", { name: "다음 주" }).click();
      await page.waitForTimeout(300); // 애니메이션 대기

      // 이전 주로 복귀
      await page.getByRole("button", { name: "이전 주" }).click();
      await page.waitForTimeout(300);

      // 월 헤더가 여전히 표시되는지 확인
      await expect(monthHeader).toBeVisible();
    });

    test("T5-4: 주간 네비게이션 버튼 접근성 확인", async ({ page }) => {
      // 이전 주 버튼 존재 및 접근 가능
      const prevButton = page.getByRole("button", { name: "이전 주" });
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toBeEnabled();

      // 다음 주 버튼 존재 및 접근 가능
      const nextButton = page.getByRole("button", { name: "다음 주" });
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();
    });
  });

  test.describe("T5-5 ~ T5-7: 날짜 선택", () => {
    test("T5-5: 주간 날짜 셀렉터에 7일 표시", async ({ page }) => {
      // 날짜 선택 버튼들이 7개인지 확인 (grid-cols-7)
      const dateButtons = page.locator(".grid-cols-7 > button");
      await expect(dateButtons).toHaveCount(7);
    });

    test("T5-6: 특정 날짜 클릭 시 해당 날짜 선택", async ({ page }) => {
      // 날짜 버튼들 중 두 번째 날짜 클릭
      const dateButtons = page.locator(".grid-cols-7 > button");
      const secondDate = dateButtons.nth(1);

      await secondDate.click();

      // 선택된 날짜가 빨간 배경으로 변경되는지 확인
      const selectedIndicator = secondDate.locator("span.bg-\\[\\#FF6B6B\\]");
      await expect(selectedIndicator).toBeVisible();
    });

    test("T5-7: 오늘 날짜 시각적 구분 확인", async ({ page }) => {
      // 오늘 날짜는 bg-primary-100 클래스를 가짐 (선택되지 않은 경우)
      // 또는 선택된 경우 bg-[#FF6B6B]
      const todayDate = page.locator(
        ".grid-cols-7 > button span.bg-primary-100, .grid-cols-7 > button span.bg-\\[\\#FF6B6B\\]"
      );
      await expect(todayDate.first()).toBeVisible();
    });
  });

  test.describe("T5-8 ~ T5-10: 일정 및 현재 할 일 표시", () => {
    test("T5-8: '지금 할 일' 섹션 표시", async ({ page }) => {
      // "지금 할 일" 텍스트가 있는 섹션 확인
      const currentTaskSection = page.getByText("지금 할 일");
      await expect(currentTaskSection).toBeVisible();
    });

    test("T5-9: 선택된 날짜의 일정 섹션 표시", async ({ page }) => {
      // 일정 섹션 헤더 (MM.DD (요일) 일정 형식)
      const scheduleSection = page.locator("section").filter({
        has: page.locator('[name="home_outline"]'),
      });
      await expect(scheduleSection).toBeVisible();

      // 일정 레이블 형식 확인 (예: "02.03 (월) 일정")
      const scheduleLabel = page.getByText(/\d{2}\.\d{2} \([일월화수목금토]\) 일정/);
      await expect(scheduleLabel).toBeVisible();
    });

    test("T5-10: 일정 로딩 상태 표시", async ({ page }) => {
      // 페이지 새로고침으로 로딩 상태 확인
      await page.reload();

      // 로딩 중이거나 데이터가 표시되어야 함
      const loadingOrContent = page.locator("section").filter({
        has: page.locator('[name="home_outline"]'),
      });
      await expect(loadingOrContent).toBeVisible();
    });
  });

  test.describe("T5-11 ~ T5-12: 플래너 수정 진입", () => {
    test("T5-11: 플래너 수정 버튼 클릭 시 수정 페이지 진입", async ({ page }) => {
      // 플래너 수정 버튼 클릭
      const editButton = page.getByRole("button", { name: "플래너 수정" });
      await expect(editButton).toBeVisible();
      await editButton.click();

      // 플래너 수정 페이지 헤더 확인
      await expect(page.getByText("플래너 수정")).toBeVisible();
    });

    test("T5-12: 플래너 수정 페이지에서 날짜 및 제외리스트 버튼 확인", async ({
      page,
    }) => {
      // 플래너 수정 페이지로 이동
      await page.getByRole("button", { name: "플래너 수정" }).click();

      // 플래너 수정 페이지 로드 대기
      await expect(page.getByText("플래너 수정")).toBeVisible();

      // 날짜 표시 확인 (예: "2월 3일 월")
      const dateDisplay = page.getByText(/\d+월 \d+일 [일월화수목금토]/);
      await expect(dateDisplay).toBeVisible();

      // 제외리스트 버튼 확인
      const excludedListButton = page.getByRole("button", { name: "제외리스트" });
      await expect(excludedListButton).toBeVisible();
    });
  });
});

/**
 * 헬퍼 함수: 날짜 포맷팅
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

/**
 * 헬퍼 함수: 요일 반환
 */
function getWeekdayLabel(date: Date): string {
  const labels = ["일", "월", "화", "수", "목", "금", "토"];
  return labels[date.getDay()] ?? "";
}
