## 상태 관리 전략 (Auth Domain)

### AuthStore

- 역할
  - 애플리케이션 전역 인증 상태를 관리한다
  - 로그인 / 로그아웃 상태를 단일 진실로 유지한다
  - 로그인 성공 시 인증 상태를 **갱신**한다
  - 로그아웃 시 인증 상태를 **초기화**한다
- **AuthStore에 저장되는 상태**

```tsx
interface AuthState {
  isAuthenticated: boolean;
  accessToken?: string;
}
```

  - `isAuthenticated`
    - 현재 앱이 **인증된 세션 상태인지 여부**
  - `accessToken?`
    - 서버 요청 시 Authorization 헤더에 사용되는 **현재 유효한 토큰**
    - refresh 실패 시 즉시 제거된다
  - `refreshToken`
    - 서버가 **httpOnly 쿠키**로 내려주는 세션 토큰
    - 클라이언트 상태/스토어에는 저장하지 않는다

- **상태 인터페이스**

```tsx
interface AuthActions {
  setAuthenticated: (token: string) => void;
  clearAuth: () => void;
}
```

  - `setAuthenticated(token)`
    - 로그인 성공 시 호출된다
    - 수행 작업
      1. `accessToken` 저장
      2. `isAuthenticated = true`로 갱신
  - `clearAuth()`
    - 로그아웃 또는 인증 무효 시 호출된다
    - 수행 작업
      1. `accessToken` 제거
      2. `isAuthenticated = false`로 변경
    - 수행하지 않는 작업
      - API 호출
      - 서버 세션 종료
      - 라우팅

### Local State

- 로그인 페이지 내부 UI 상태
  - 입력 포커스
  - 에러 메시지 노출 여부
- `react-hook-form`을 통한 폼 상태 관리

### Server Cache State (React Query)

- 로그인 API 호출(`POST /token`)은 mutation으로 처리
- 일반 API 요청은 accessToken을 기반으로 캐싱 관리
- refresh 이후 재시도 로직은 Query 레벨에서 처리
