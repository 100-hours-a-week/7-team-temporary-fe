## 폼/모델/DTO 분리 기준

이 문서는 `useApiMutation`의 `dtoFn` 설계를 기준으로 Form Model과 Request DTO를 분리하는 원칙을 정리한다.

### 핵심 원칙

- Form Component는 입력/검증만 담당하고 **Form Model**을 전달한다.
- Form Model과 Request DTO 타입은 `features/*/model/types.ts`에 둔다.
- DTO 변환은 feature model의 mutation(`useApiMutation`의 `dtoFn`)에서 수행한다.
- 서버 응답은 Query 캐시에 저장되고 UI는 캐시 기반으로 갱신한다.

### 구조 예시

```text
features/
└─ auth/
   └─ login/
      └─ model/
         ├─ types.ts        # LoginFormModel, LoginRequestDto
         └─ useLoginMutation.ts
```

### DTO 변환 위치 예시

```tsx
import { useApiMutation } from "@/shared/query";

import type { LoginFormModel, LoginRequestDto, LoginResponse } from "./types";

export function useLoginMutation() {
  return useApiMutation<LoginFormModel, LoginRequestDto, LoginResponse>({
    url: "/api/token",
    method: "POST",
    dtoFn: (form) => ({
      email: form.email,
      password: form.password,
    }),
    invalidateKeys: [],
  });
}
```

### Form Component 역할

- 입력값 상태 관리 및 검증(RHF/Schema)
- **Form Model** 생성 후 `onSubmit`으로 전달

### Page Hook 역할

- `useApiMutation` 호출
- mutation 결과를 UI에 맞는 상태로 변환

### 참고

- Query Layer 정책: `useApiMutation`에서 DTO 변환을 수행한다.
- UI는 Query 캐시 기반으로 갱신한다.

