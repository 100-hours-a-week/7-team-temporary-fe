import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

/**
 * 인증 설정 파일
 * 테스트 실행 전 로그인하여 인증 상태를 저장합니다.
 *
 * 사용법:
 * 1. playwright.config.ts에서 setup 프로젝트 주석 해제
 * 2. 각 프로젝트에 dependencies: ["setup"] 추가
 * 3. 테스트 실행
 */
setup("authenticate", async ({ page }) => {
  // 로그인 페이지로 이동
  await page.goto("/login");

  // 로그인 폼 대기
  await expect(page.getByRole("heading", { name: /로그인/i })).toBeVisible();

  // 이메일/비밀번호 입력 (실제 테스트 계정으로 변경 필요)
  await page.getByPlaceholder("이메일").fill(process.env.TEST_USER_EMAIL || "test@example.com");
  await page
    .getByPlaceholder("비밀번호")
    .fill(process.env.TEST_USER_PASSWORD || "testpassword123");

  // 로그인 버튼 클릭
  await page.getByRole("button", { name: /로그인/i }).click();

  // 홈 페이지로 리다이렉트 확인
  await expect(page).toHaveURL(/\/home/);

  // 홈 페이지 로드 확인
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();

  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});
