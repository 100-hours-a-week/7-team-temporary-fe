/**
 * shared/auth의 역할은 "entity를 공개"하는 게 아니라
 * shared 레이어가 entities/user를 직접 의존하지 않도록
 * 의존성 방향을 통제하는 중간 어댑터다.
 *
 * 그래서 configureAuthHandlers로 실제 구현(entities/user)을 주입하고,
 * shared 코드는 getAccessToken/clearAuth 같은 인터페이스만 사용한다.
 */
export type AuthHandlers = {
  getAccessToken?: () => string | undefined;
  setAuthenticated?: (token: string) => void;
  clearAuth?: () => void;
};

let handlers: AuthHandlers = {};

/**
 * 인증 핸들러 콜백을 등록/갱신한다.
 * shared 레이어가 entities/user 스토어에 직접 의존하지 않도록
 * 동작을 주입하는 역할이다.
 */
export function configureAuthHandlers(next: AuthHandlers) {
  handlers = { ...handlers, ...next };
}

/**
 * 등록된 핸들러가 있으면 현재 액세스 토큰을 반환한다.
 * shared 코드가 entity 스토어를 import하지 않고
 * 인증 상태를 읽기 위한 간접 접근이다.
 */
export function getAccessToken() {
  return handlers.getAccessToken?.();
}

/**
 * 인증 성공 토큰을 등록된 핸들러로 전달한다.
 * 보통 refresh 이후 entity/user 스토어 갱신에 사용된다.
 */
export function setAuthenticated(token: string) {
  handlers.setAuthenticated?.(token);
}

/**
 * 등록된 핸들러를 통해 인증 상태를 초기화한다.
 * 로그아웃 또는 401 처리 시 user auth 상태 무효화에 사용된다.
 */
export function clearAuth() {
  handlers.clearAuth?.();
}
