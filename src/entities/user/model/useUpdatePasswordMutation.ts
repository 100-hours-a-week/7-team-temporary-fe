import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { updatePassword } from "../api";
import type { UpdatePasswordModel } from "./types";

export function useUpdatePasswordMutation(
  options: UseMutationOptions<unknown, unknown, UpdatePasswordModel> = {},
) {
  return useMutation({
    mutationFn: (variables: UpdatePasswordModel) => updatePassword(variables),
    ...options,
  });
}
