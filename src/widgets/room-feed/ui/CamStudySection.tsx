"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  camStudyRoomQueryKeys,
  getCamStudyStatus,
  useCamStudyRoomListQuery,
} from "@/entities/cam-study-room";
import type { CamStudyRoomListItemVM } from "@/entities/cam-study-room";
import { usePaginatedAccumulator, useInfiniteScrollTrigger } from "@/shared/hooks";
import { useToast } from "@/shared/ui/toast";
import { useStackPage } from "@/widgets/stack";
import { useQueryClient } from "@tanstack/react-query";

import { CamStudyRoomList } from "./CamStudyRoomList";

const CAM_STUDY_LIST_PAGE = 1;
const CAM_STUDY_LIST_SIZE = 10;

interface CamStudySectionProps {
  enabled: boolean;
  onRoomClick: (room: CamStudyRoomListItemVM) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
}

export function CamStudySection({ enabled, onRoomClick, scrollRef }: CamStudySectionProps) {
  const { depth } = useStackPage();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const handleRoomClick = useCallback(
    (room: CamStudyRoomListItemVM) => {
      if (getCamStudyStatus(room).key === "FULL") {
        showToast("정원이 가득 차 입장할 수 없습니다.", "error");
        return;
      }
      onRoomClick(room);
    },
    [onRoomClick, showToast],
  );
  const [currentPage, setCurrentPage] = useState(CAM_STUDY_LIST_PAGE);
  const previousStackDepthRef = useRef(depth);

  const roomListQuery = useCamStudyRoomListQuery({
    enabled,
    page: currentPage,
    size: CAM_STUDY_LIST_SIZE,
    staleTime: 5 * 60 * 1000,
  });

  const {
    fetchedItems: rooms,
    hasMore,
    isInitialLoading,
    isFetching,
    isError,
  } = usePaginatedAccumulator<CamStudyRoomListItemVM>({
    data: roomListQuery.data,
    isLoading: roomListQuery.isLoading,
    isFetching: roomListQuery.isFetching,
    isError: roomListQuery.isError,
    currentPage,
    initialPage: CAM_STUDY_LIST_PAGE,
    pageSize: CAM_STUDY_LIST_SIZE,
    getKey: (item) => item.roomId,
    enabled,
  });

  // 섹션 마운트 시 스크롤 초기화
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 캠 스터디방에서 돌아올 때 목록 재조회
  useEffect(() => {
    const previousDepth = previousStackDepthRef.current;
    previousStackDepthRef.current = depth;

    if (!enabled) return;
    if (previousDepth <= 0 || depth !== 0) return;

    setCurrentPage(CAM_STUDY_LIST_PAGE);
    void queryClient.invalidateQueries({ queryKey: camStudyRoomQueryKeys.listAll() });
  }, [depth, enabled, queryClient]);

  const loadMore = useCallback(() => {
    if (!enabled || !hasMore || roomListQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [enabled, hasMore, roomListQuery.isFetching]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
    rootRef: scrollRef,
  });

  return (
    <>
      {isInitialLoading ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          캠 스터디방 목록을 불러오는 중...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          캠 스터디방 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {!isInitialLoading && !isError ? (
        <CamStudyRoomList
          items={rooms}
          onRoomClick={handleRoomClick}
        />
      ) : null}

      {!isInitialLoading && !isError ? (
        <>
          <div
            ref={loadMoreRef}
            className="h-px"
          />
          {isFetching && hasMore ? (
            <div className="pt-2 text-center text-xs text-neutral-400">불러오는 중...</div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
