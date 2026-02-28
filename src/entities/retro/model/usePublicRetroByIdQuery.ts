import { useQuery } from "@tanstack/react-query";

import { fetchPublicRetroById } from "../api";

import { toPublicRetroCardVM } from "./mappers";
import { retroQueryKeys } from "./queryKeys";

export function usePublicRetroByIdQuery(reflectionId: number) {
  return useQuery({
    queryKey: retroQueryKeys.detail(reflectionId),
    queryFn: ({ signal }) => fetchPublicRetroById(reflectionId, signal),
    select: toPublicRetroCardVM,
    staleTime: 1000 * 60 * 5,
  });
}
