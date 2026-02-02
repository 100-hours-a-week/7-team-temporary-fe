## apiFetch

아래 코드는 **공통 API fetch 유틸 함수**를 타입 안정성 있게 감싼 구현이다.  
한 줄 요약하면 **`fetch`를 직접 쓰지 않고, 에러 처리·JSON 파싱·응답 포맷 통일을 강제하기 위한 래퍼 함수**다.

아래에서 **구성 요소 → 실행 흐름 → 설계 의도** 순서로 해석한다.

---

## 1. 상단 import / 상수 정의

```ts
import { ApiError } from "./error";
import type { ApiResponse, HttpMethod, RequestConfig } from "./types";
```

- `ApiError`
  - HTTP 에러를 표현하기 위한 **커스텀 에러 클래스**
- `ApiResponse<T>`
  - `{ data: T }` 형태의 **서버 표준 응답 포맷** 타입
- `HttpMethod`
  - `"GET" | "POST" | ...` 같은 HTTP 메서드 유니온
- `RequestConfig<TBody>`
  - `fetch` 옵션을 타입으로 감싼 설정 객체

```ts
const DEFAULT_METHOD: HttpMethod = "GET";
const CONTENT_TYPE_JSON = "application/json";
```

- 기본 메서드는 GET
- Content-Type은 JSON으로 강제

---

## 2. 에러 메시지 추출 유틸

```ts
function getErrorMessage(payload: unknown, fallback: string) {
```

### 역할

- 서버 에러 응답이 JSON일 경우:

```json
{ "message": "에러 설명" }
```

→ 이 `message`를 사용자 에러 메시지로 사용  
그렇지 않으면 `fallback`(보통 `res.statusText`) 사용

### 내부 로직

```ts
if (payload && typeof payload === "object" && "message" in payload) {
  const message = payload.message;
  if (typeof message === "string") return message;
}

return fallback;
```

- `unknown`을 안전하게 좁혀서:
  - 객체인지
  - `message` 필드가 있는지
  - 문자열인지
- 전부 만족하면 해당 메시지 반환
- 조건 불만족 시 기본 메시지 사용

---

## 3. apiFetch 함수 시그니처

```ts
export async function apiFetch<TResponse, TBody = unknown>(
```

### 제네릭 의미

- `TResponse`
  - **최종적으로 호출자가 받게 될 데이터 타입**
- `TBody`
  - request body 타입 (기본 `unknown`)

```ts
(
  url: string,
  config: RequestConfig<TBody> = {},
): Promise<TResponse>
```

- `config`를 optional로 받아서
- **항상 `TResponse`를 반환하는 Promise**로 강제

---

## 4. 요청 옵션 정리

```ts
const { method = DEFAULT_METHOD, body, headers, signal, token } = config;
```

- `method` 기본값 GET
- `token`이 있는 경우 Authorization 헤더에 사용
- `signal`은 AbortController 용

```ts
const hasBody = body !== undefined && method !== "GET";
```

- GET 요청에는 body를 붙이지 않기 위한 방어 로직

---

## 5. fetch 호출부

```ts
const res = await fetch(url, {
```

### headers 구성

```ts
headers: {
  "Content-Type": CONTENT_TYPE_JSON,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...headers,
},
```

- 기본적으로 JSON 요청
- token이 있으면 Bearer 인증 자동 추가
- 호출부에서 넘긴 headers는 마지막에 병합 → 오버라이드 가능

### body 처리

```ts
...(hasBody ? { body: JSON.stringify(body) } : {}),
```

- body가 있고, GET이 아닐 때만 JSON 직렬화해서 추가

---

## 6. 응답 Content-Type 판별

```ts
const contentType = res.headers.get("Content-Type") ?? "";
const isJson = contentType.includes("application/json");
```

- JSON 응답인지 여부를 명시적으로 판단
- 이후 파싱 분기 처리에 사용

---

## 7. HTTP 에러 처리 (중요)

```ts
if (!res.ok) {
```

- HTTP status가 200~299가 아니면 무조건 에러로 간주

```ts
const payload = isJson ? await res.json().catch(() => undefined) : undefined;
```

- JSON이면 body 파싱 시도
- 파싱 실패해도 throw 방지

```ts
const message = getErrorMessage(payload, res.statusText);
throw new ApiError(res.status, message);
```

### 핵심 포인트

- `fetch`는 4xx/5xx에서도 reject하지 않음
- 이 코드가 **명시적으로 에러를 throw**
- 호출자는 try/catch 또는 TanStack Query error boundary로 처리 가능

---

## 8. JSON이 아닌 성공 응답 처리

```ts
if (!isJson) {
  return undefined as TResponse;
}
```

- 예: `204 No Content`, 파일 다운로드 등
- 타입 시스템을 만족시키기 위해 `undefined` 반환

---

## 9. JSON 응답 파싱 + 표준 응답 처리

```ts
const data = (await res.json()) as ApiResponse<TResponse> | TResponse;
```

- 서버 응답이
  - `{ data: T }` 형태일 수도 있고
  - 그냥 `T`일 수도 있다는 가정

```ts
if (data && typeof data === "object" && "data" in data) {
  return (data as ApiResponse<TResponse>).data;
}
```

- `data` 필드가 있으면 실제 payload만 추출해서 반환

```ts
return data as TResponse;
```

- 아니면 그대로 반환

---

## 10. 전체 설계 의도 요약

이 함수는 다음을 **강제**한다.

1. **에러 처리 일관성**
   - HTTP 에러 → 무조건 `ApiError` throw
   - 메시지 추출 규칙 통일
2. **응답 포맷 추상화**
   - `{ data: T }` / `T` 혼재 허용
   - 호출부는 항상 `T`만 신경 쓰면 됨
3. **타입 안정성**
   - request body / response 타입 분리
   - `any` 사용 없음
4. **fetch 사용 규칙 중앙화**
   - Authorization, Content-Type, JSON 직렬화
   - 각 feature/page에서 중복 제거

---

## 실무 관점 한 줄 평가

> 이 코드는 **“fetch를 직접 쓰지 못하게 만들기 위한 안전한 API 레이어”**이며,  
> FSD 구조에서 `shared/api` 레이어에 두기에 적합한 구현이다.
