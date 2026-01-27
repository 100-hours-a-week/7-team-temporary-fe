import { useMutation } from "@tanstack/react-query";

import { updatePassword } from "../api";
import type { UpdatePasswordModel } from "./types";

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (variables: UpdatePasswordModel) => updatePassword(variables),
  });
}
