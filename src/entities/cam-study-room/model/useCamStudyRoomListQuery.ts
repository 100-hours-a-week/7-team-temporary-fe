import { useQuery } from "@tanstack/react-query";

import { fetchCamStudyRoomList } from "../api";

import { toCamStudyRoomListModel } from "./camStudyRoomList.mapper";
import { camStudyRoomQueryKeys } from "./queryKeys";

interface UseCamStudyRoomListQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
}

export function useCamStudyRoomListQuery({
  page = 1,
  size = 10,
  enabled = true,
  refetchOnMount,
}: UseCamStudyRoomListQueryOptions = {}) {
  return useQuery({
    queryKey: camStudyRoomQueryKeys.list(page, size),
    queryFn: ({ signal }) => fetchCamStudyRoomList({ page, size, signal }),
    select: (dto) => toCamStudyRoomListModel(dto),
    enabled,
    refetchOnMount,
  });
}
