import { useOptimisticMutation } from "@/shared/query";

import { updateMyProfileImage } from "../api";
import type { MyProfileModel, UpdateMyProfileImageModel } from "./types";
import { userQueryKeys } from "./queryKeys";

export function useUpdateMyProfileImageMutation() {
  return useOptimisticMutation<UpdateMyProfileImageModel, MyProfileModel>({
    mutationFn: (variables) => updateMyProfileImage(variables.imageKey),
    queryKey: userQueryKeys.me(),
    getOptimisticData: (previous, variables) => {
      if (!previous) {
        return undefined as unknown as MyProfileModel;
      }
      return {
        ...previous,
        profileImageKey: variables.imageKey,
        profileImageUrl: variables.profileImageUrl ?? previous.profileImageUrl,
      };
    },
    invalidateKeys: [userQueryKeys.me()],
  });
}
