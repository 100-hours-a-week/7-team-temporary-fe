import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("user");

export const userQueryKeys = {
  ...baseKeys,
  me: () => baseKeys.by("me"),
};
