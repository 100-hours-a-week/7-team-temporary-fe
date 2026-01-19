export const queryKeyFactory = <TScope extends string>(scope: TScope) => {
  const all = [scope] as const;

  return {
    all,
    by: (...parts: readonly unknown[]) => [...all, ...parts] as const,
  };
};
