## queryKeyFactory

### 한 줄 요약

`queryKeyFactory`는 **도메인별 queryKey를 중복 없이, 타입이 깨지지 않게 만들기 위한 유틸 함수**다.

---

## 코드 구조 해설

```ts
export const queryKeyFactory = <TScope extends string>(scope: TScope) => {
```

### `<TScope extends string>`

- `scope`는 반드시 문자열이다.
- 동시에 **리터럴 타입을 유지**하기 위해 제네릭으로 받는다.

```ts
queryKeyFactory("user"); // "user" 리터럴 타입 유지
```

---

```ts
const all = [scope] as const;
```

### `all`의 의미

- 해당 도메인의 **최상위 queryKey**
- `as const`로 인해 타입은 `readonly ["user"]` 형태가 된다.

즉:

- 값: `["user"]`
- 타입: **튜플 + readonly + 리터럴 유지**

---

```ts
return {
  all,
  by: (...parts: readonly unknown[]) => [...all, ...parts] as const,
};
```

## `by` 함수의 의미

- `scope`를 **항상 맨 앞에 고정**
- 뒤에 어떤 key 조각이 오든 붙인다.

```ts
const userKeys = queryKeyFactory("user");

userKeys.all;            // ["user"]
userKeys.by("me");       // ["user", "me"]
userKeys.by("detail", id); // ["user", "detail", "u_123"]
```

타입도 유지된다:

```ts
readonly ["user", "detail", string]
```

---

## 왜 필요한가?

### 흔한 문제

- 오타
- 순서 불일치
- invalidate 안 먹음
- 같은 데이터인데 캐시가 갈라짐

```ts
["user", "me"]
["users", "me"]
["user", "detail", id]
["user", id]
```

### 이 팩토리를 쓰면

1. **scope 강제**
2. **key 구조 통일**
3. **타입으로 queryKey 형태 고정**
4. invalidate / refetch 실수 감소

---

## TanStack Query 관점

- queryKey는 **캐시의 식별자**
- 문자열 하나 틀리면 **완전히 다른 캐시**

이 함수는:

> queryKey를 사람이 기억하지 말고  
> **코드와 타입이 강제하도록 하자**

---

## 실제 사용 예

```ts
// shared/api/queryKeys.ts
export const userQueryKeys = queryKeyFactory("user");
```

```ts
useApiQuery<UserResponse>({
  queryKey: userQueryKeys.by("me"),
  url: "/users/me",
});
```

```ts
queryClient.invalidateQueries({
  queryKey: userQueryKeys.all,
});
```

`all`을 넣으면 `"user"`로 시작하는 모든 쿼리가 무효화된다.

---

## 타입 설계 포인트

### `as const`를 두 번 쓰는 이유

- queryKey는 **tuple + readonly** 여야 한다.
- 그래야 리터럴 타입 유지, 타입 추론 정상 동작, key widening 방지.

---

## 한 줄 결론

> 이 코드는 queryKey를 “문자열 배열”이 아니라  
> “도메인 단위의 타입 안전한 식별자”로 만들기 위한 팩토리다.

