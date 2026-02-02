이 함수는 한 문장으로 말하면 이거다.

> **“Zod가 만들어 준 에러 덩어리를
> 화면(UI)에서 바로 쓰기 좋은 ‘필드별 에러 객체’로 변환한다.”**

아래에서 **한 줄씩, 사람 말로** 풀어줄게.

---

## 함수 전체 구조부터

```ts
export const getSignUpFormErrors = (
  issue: z.ZodError<SignUpFormModel>
): SignUpFormErrors => {
  ...
};
```

### 의미

- 입력값: `ZodError`
  - `signUpFormSchema.safeParse(...)`가 실패했을 때 나오는 에러 객체

- 반환값: `SignUpFormErrors`
  - `{ email?: string; password?: string; ... }` 형태의 객체

👉 **“Zod 전용 에러 → UI 전용 에러” 변환기**

---

## 1️⃣ 결과로 만들 객체

```ts
const errors: SignUpFormErrors = {};
```

이건 최종적으로 이런 모양이 될 애다.

```ts
{
  email: "이메일 형식이 올바르지 않습니다.",
  password: "비밀번호는 8~20자여야 합니다.",
}
```

---

## 2️⃣ Zod 에러는 여러 개일 수 있다

```ts
issue.issues.forEach((item) => {
```

Zod 에러 구조는 이렇다.

```ts
issue.issues = [
  { path: ["email"], message: "이메일을 입력해주세요." },
  { path: ["password"], message: "비밀번호가 짧습니다." },
  ...
]
```

그래서 하나씩 순회한다.

---

## 3️⃣ 이 에러가 어떤 필드의 에러인지 뽑기

```ts
const key = item.path[0];
```

- `path`는 배열이다 (중첩 객체 대비)
- 지금 폼은 1단계라서 첫 번째만 사용

예:

```ts
["email"] → "email"
```

---

## 4️⃣ 이 줄이 핵심이다

```ts
if (!isSignUpFormKey(key) || errors[key]) return;
```

이걸 말로 풀면:

> ❌ 우리 폼 필드가 아니면 무시
> ❌ 이미 이 필드 에러를 넣었으면 무시

### 왜 필요하냐?

#### ① Zod 에러가 항상 “폼 필드”만 가리키진 않는다

- object-level error
- refine에서 만든 커스텀 에러
- 예상치 못한 path

👉 안전장치

#### ② 한 필드에 에러가 여러 개일 수 있다

```ts
nickname:
- 비어 있음
- 길이 초과
- 허용 문자 아님
```

하지만 UI에서는 보통 **첫 번째 에러만 보여준다**.

👉 그래서 `errors[key]`가 이미 있으면 skip

---

## 5️⃣ 실제로 에러를 저장하는 부분

```ts
errors[key] = item.message;
```

예:

```ts
errors["email"] = "이메일 형식이 올바르지 않습니다.";
```

---

## 6️⃣ 최종 반환

```ts
return errors;
```

UI에서 바로 쓸 수 있는 형태 완성.

---

## 이 함수가 없으면 어떻게 되냐?

UI에서 이런 걸 직접 해야 한다.

```ts
result.error.issues[0].path[0];
result.error.issues[0].message;
```

- Zod 구조에 UI가 강하게 결합됨
- 코드 읽기 어려움
- 재사용 불가

👉 그래서 **“어댑터 함수”**를 만든 거다.

---

## 한 줄 요약 (이거만 기억해도 됨)

> **이 함수는
> Zod의 복잡한 에러 구조를
> `{ 필드명: 에러메시지 }` 형태로 바꿔주는 UI 어댑터다.**

---

## 아주 짧은 예시로 끝내면

### Zod 에러 입력

```ts
{
  issues: [
    { path: ["email"], message: "이메일 필수" },
    { path: ["password"], message: "비밀번호 필수" },
  ];
}
```

### 이 함수 출력

```ts
{
  email: "이메일 필수",
  password: "비밀번호 필수"
}
```

지금 이걸 이해했으면
**폼 검증 + Zod + UI 연결 구조는 거의 다 이해한 상태**다.
