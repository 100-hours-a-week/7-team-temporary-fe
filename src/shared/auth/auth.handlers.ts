/**
 * shared/auth의 역할은 "entity를 공개"하는 게 아니라
 * shared 레이어가 entities/user를 직접 의존하지 않도록
 * 의존성 방향을 통제하는 중간 어댑터다.
 *
 * 그래서 configureAuthHandlers로 실제 구현(entities/user)을 주입하고,
 * shared 코드는 clearAuth 같은 인터페이스만 사용한다.
 */
export type AuthHandlers = {
  setAuthenticated?: () => void;
  setUserId?: (userId: number) => void;
  clearAuth?: () => void;
};

let handlers: AuthHandlers = {};

export function configureAuthHandlers(next: AuthHandlers) {
  handlers = { ...handlers, ...next };
}

export function setAuthenticated() {
  handlers.setAuthenticated?.();
}

export function setAuthUserId(userId: number) {
  handlers.setUserId?.(userId);
}

export function clearAuth() {
  handlers.clearAuth?.();
}
