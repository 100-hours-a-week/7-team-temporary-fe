import { useOptimisticMutation } from "@/shared/query";

import { updateMyProfile } from "../api";
import type { MyProfileModel, UpdateMyProfileModel } from "./types";
import { userQueryKeys } from "./queryKeys";

export function useUpdateMyProfileMutation() {
  return useOptimisticMutation<UpdateMyProfileModel, MyProfileModel>({
    mutationFn: (variables) => updateMyProfile(variables),
    queryKey: userQueryKeys.me(),
    getOptimisticData: (previous, variables) => {
      if (!previous) {
        return undefined as unknown as MyProfileModel;
      }
      return { ...previous, ...variables };
    },
    invalidateKeys: [userQueryKeys.me()],
  });
}
