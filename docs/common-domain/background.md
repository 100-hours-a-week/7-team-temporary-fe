## 배경 (Background)

### 프로젝트 목표 (Objective)

본 프로젝트는 서버에서 관리되는 데이터를 **클라이언트 전역 상태와 명확히 분리**하고, 서버 상태(Server State)를 **TanStack Query를 단일 진입점으로 사용하여 일관되게 관리**하는 것을 목표로 한다.

특히 서버 상태는 캐싱, 무효화, 재요청, 에러 처리 등 복잡한 생명주기를 가지므로, 개별 컴포넌트나 페이지에서 직접 fetch 로직을 다루지 않고 **Query Layer를 중심으로 책임을 집중**하여 예측 가능한 데이터 흐름을 구성한다. 또한 API 통신(Transport Layer), 서버 상태 관리(Query Layer), UI 제어(Page Layer)를 명확히 분리함으로써 기능 확장 시 서버 상태 관련 로직의 수정 범위를 최소화한다.

- **핵심 결과 (Key Result) 1:** 서버 상태 조회 및 변경 흐름을 `useApiQuery / useApiMutation`으로 단일화하여 fetch 직접 호출 제거
- **핵심 결과 (Key Result) 2:** queryKey, cache / stale 정책, invalidation 규칙을 공통화하여 서버 상태 동기화 기준 일관성 확보
- **핵심 결과 (Key Result) 3:** Transport Layer(apiFetch)와 Query Layer의 책임을 분리하여 서버 상태 로직 변경 시 UI 영향 최소화

### 문제 정의 (Problem)

- **서버 상태와 클라이언트 상태의 혼재:** 서버에서 관리되는 데이터를 컴포넌트 또는 전역 상태로 직접 관리할 경우, 캐싱, 재요청, 동기화 기준이 불명확해지고 상태 흐름을 추적하기 어려워진다.
- **fetch 로직의 분산:** 페이지나 컴포넌트 단위에서 fetch를 직접 호출하면 에러 처리, 로딩 상태, 재시도 정책이 각기 다르게 구현되어 일관성을 유지하기 어렵다.
- **queryKey 및 캐시 정책의 비일관성:** queryKey를 문자열로 임의 작성하거나 invalidate 기준이 명확하지 않을 경우, 불필요한 재요청 또는 캐시 불일치 문제가 발생할 수 있다.
- **mutation 이후 상태 동기화의 불명확성:** 서버 상태 변경 후 클라이언트 상태를 직접 수정하거나 전역 invalidate를 사용할 경우, 실제 서버 상태와 UI 간의 불일치 가능성이 증가한다.

### 가설 (Hypothesis)

서버 상태를 **TanStack Query 기반 Query Layer로 완전히 위임**하고, 서버 상태 조회(`useApiQuery`)와 변경(`useApiMutation`)을 **단일 진입점으로 제한**한다면 서버 상태의 생명주기를 명확히 정의할 수 있을 것으로 판단한다.

또한,

- apiFetch는 HTTP 요청/응답만 담당하는 **순수 Transport Layer**로 한정하고
- queryKey 생성 규칙과 cache / stale / invalidation 정책을 공통 규칙으로 강제하며
- mutation 이후 상태 확정은 반드시 **invalidate → refetch 흐름**을 따르도록 한다면

서버 상태의 최종 기준을 항상 서버로 유지하면서도 UI 레벨에서는 예측 가능한 데이터 흐름과 일관된 UX를 제공할 수 있을 것이다.
