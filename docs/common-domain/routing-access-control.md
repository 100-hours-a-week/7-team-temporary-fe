## 라우팅 및 접근 제어 (Routing & Access Control)

### Route Guard (인증 접근 제어)

- **서버 레벨 미들웨어와 클라이언트 레벨 Route Guard를 병행**하여 구성한다.
- 인증 상태의 **단일 진실(Single Source of Truth)** 은 `AuthStore`이다.
- 접근 제어는 **요청 단계(미들웨어)** 와 **UI 단계(Route Guard)** 로 분리하여 수행한다.

### 1차 접근 제어 – Middleware (Server-side)

- Next.js **Middleware**는 브라우저 요청이 페이지/레이아웃 로직에 도달하기 전에 실행된다.
- **refreshToken 쿠키** 존재 여부로 **페이지 접근 자체를 허용 또는 차단**한다.
- **accessToken은 Authorization 헤더로만 전달**되며, 미들웨어 접근 제어에는 사용하지 않는다.
- **미들웨어 역할**
  - 보호된 라우트에 대한 **미인증 요청 차단**
  - 공개 라우트에 대한 **인증된 사용자 접근 차단**
- **미들웨어 동작**
  - 보호 대상 라우트에 `refreshToken` 쿠키 없이 접근 시 → `/login`으로 리다이렉트
  - 공개 라우트(`/login`, `/sign-up/*`)에 `refreshToken` 쿠키가 있는 상태로 접근 시 → `/home`으로 리다이렉트

### 2차 접근 제어 – Route Guard (Client-side)

- 클라이언트 Route Guard는 `AuthStore.isAuthenticated` 상태를 기준으로 동작한다.
- **접근 제어 수행 상황**
  - **로그인 성공**
    - 수행 주체: Page(LoginPage) → AuthStore → Route Guard
    - 수행 흐름

```tsx
POST /token 성공
    ↓
LoginPage.onSuccess : LoginPage
    ↓
AuthStore.setAuthenticated(accessToken) : AuthStore(유저 전역상태관리)
    ↓
/home redirect : Route Guard
```

  - **로그아웃**
    - 수행 주체: AuthService → AuthStore → Route Guard
    - 수행 흐름

```tsx
사용자 로그아웃 클릭
    ↓
AuthService.logout()
    ↓
AuthStore.clearAuth()
    ↓
/login redirect : Route Guard
```

  - **로그인 실패 → refresh token 실패**
    - 수행 주체: AuthService (또는 apiFetch) → AuthStore → Route Guard

  - 클라이언트 상태 초기화

- **Route Guard**는 **미들웨어 이후 단계에서 UI 상태와 라우트를 동기화**하는 역할을 담당한다.

### 역할 구분

- Middleware: **요청 단위 “접근” 제어**
- Route Guard: **인증 상태 변화**에 따른 UI 흐름 보정

### 공개 라우트

- `/login`
- `/sign-up/*`
- `/둘러보기`
- `/회고`

**공개 라우트 외의 라우트는 모두 보호 대상**

### 정책

- 인증되지 않은 상태에서 접근 시 `/login`으로 리다이렉트 (미들웨어 1차 차단 + Route Guard 2차 보정)

### 토큰 인증 실패 제어

- `AuthService`: 인증 실패를 어떻게 해석할지 결정하는 곳
  - **역할**
    - 인증 만료 상황을 해석하고 **대응 전략을 결정한다.**
    - **refresh token(`PUT /token`)**을 통한 세션 복구를 시도한다.
    - 복구 실패 시 인증 상태를 무효화한다.
  - **호출 시점**
    - 일반 API 요청 → **인증 오류(401) 발생 시** refresh token 재발급
  - **인증 오류 해석 함수**

```tsx
handleAuthError(error:ApiError):Promise<AuthResolution>
```

  - **입력:** `ApiError` (status 포함)
  - **역할:** refresh 가능한 인증 오류인지, 즉시 로그아웃해야 하는 오류인지 판단한다.
  - **출력:** 다음 행동을 상위 레이어가 결정할 수 있는 **결과 값**

  - 로그아웃
    - 사용자 로그아웃 또는 인증 복구 실패 시
