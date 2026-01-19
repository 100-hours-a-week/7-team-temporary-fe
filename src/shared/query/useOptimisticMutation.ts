import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseOptimisticMutationProps<TVariables, TCache> {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  queryKey: readonly unknown[];
  getOptimisticData: (previous: TCache | undefined, variables: TVariables) => TCache;
  invalidateKeys: readonly unknown[][];
}

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
    onError: (_error, _vars, context) => {
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
