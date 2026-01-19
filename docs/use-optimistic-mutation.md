## useOptimisticMutation

역할: **낙관적 업데이트의 동작과 순서를 강제**한다.

---

## 개요

### 적용 범위

- 기본적으로 invalidate(캐시 무효화) 기반 동기화
- Optimistic Update는 예외적으로 허용하며, 적용 여부는 아래 조건을 만족해야 한다

### 허용 조건

- 변경 대상이 단일 엔티티, 단일 필드 (한 객체의 한 값 정도)
- 프론트에서 결과를 예측할 수 있다 (서버가 복잡한 계산을 안 함)
- 실패하면 어떻게 되돌릴지 명확하다 (이전 값이 분명해서 그대로 원복 가능)
- 영향받는 데이터가 많지 않다 (어떤 query만 다시 불러오면 되는지 정확히 안다)

---

## useOptimisticMutation 인터페이스

```ts
interface UseOptimisticMutationProps<TVariables, TCache> {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  queryKey: readonly unknown[];
  getOptimisticData: (
    previous: TCache | undefined,
    variables: TVariables
  ) => TCache;
  invalidateKeys: readonly unknown[][];
}
```

### 필드 설명

- `mutationFn`: 실제 서버 요청
- `queryKey`: optimistic update를 적용할 기준 캐시
- `getOptimisticData`: 이전 캐시(previous) + 입력값(variables) → 임시 상태 계산
- `invalidateKeys`: 성공 후 반드시 invalidate할 query 목록

---

## 구현 예시

```ts
export function useOptimisticMutation<TVariables, TCache>({
  mutationFn,
  queryKey,
  getOptimisticData,
  invalidateKeys,
}: UseOptimisticMutationProps<TVariables, TCache>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<TCache>(queryKey);
      const optimistic = getOptimisticData(snapshot, variables);
      if (optimistic !== undefined) {
        queryClient.setQueryData(queryKey, optimistic);
      }
      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData(queryKey, context.snapshot);
      }
    },

    onSettled: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}
```

---

## onMutate 흐름

1. 관련 query를 cancel한다
2. 기존 캐시 스냅샷을 저장한다
3. 낙관적 데이터(optimistic)를 계산한다
4. `setQueryData`로 임시 반영한다

---

## 롤백 / 무효화 규칙

- `onError`에서 반드시 **롤백(이전 캐시를 setQueryData)**한다
- `onSuccess`에서 서버 응답을 즉시 캐시에 직접 반영하지 않는다
- **onSettled 또는 onSuccess에서 반드시 invalidate**한다
- 최종 상태는 **서버 기준으로 확정**한다

---

## 사용 예시: 할일 토글

```ts
export function useToggleTodoDone(date: string) {
  return useOptimisticMutation<{ todoId: string }, DailyPlanner>({
    mutationFn: (vars) =>
      apiFetch("/api/todos/toggle", {
        method: "PATCH",
        body: vars,
      }),

    queryKey: plannerKeys.daily(date),

    getOptimisticData: (previous, vars) => {
      if (!previous) return previous as any;

      return {
        ...previous,
        todos: previous.todos.map((t) =>
          t.id === vars.todoId ? { ...t, isDone: !t.isDone } : t,
        ),
      };
    },

    invalidateKeys: [plannerKeys.daily(date)],
  });
}
```

### 실행 순서

1. 사용자 액션 (할 일 완료 토글 클릭)
2. mutation 실행 (`useToggleTodoDone` → `useOptimisticMutation`)
3. onMutate 단계
   - query cancel
   - snapshot 저장
   - 낙관적 데이터 캐시 반영
4. 서버 요청 전송
5. 에러 발생 시 롤백
6. 요청 종료 후 invalidate
7. refetch로 서버 기준 상태 확정

