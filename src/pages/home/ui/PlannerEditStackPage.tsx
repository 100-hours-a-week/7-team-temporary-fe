"use client";

import { useEffect, useMemo, useState } from "react";

import { END_HOUR, START_HOUR, TaskBasketButton, TimeSlotList } from "@/features/home";
import { BottomSheet } from "@/shared/ui";
import { useStackPage } from "@/widgets/stack";
import { TaskBasketStackPage } from "./TaskBasketStackPage";

export function PlannerEditStackPage() {
  const { push, setHeaderContent } = useStackPage();
  const today = useMemo(() => new Date(), []);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const timeSlots = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index),
    [],
  );

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">플래너 수정</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const handleOpenTaskBasket = () => {
    push(<TaskBasketStackPage />);
  };

  return (
    <>
      <div className="px-6 pt-[13px] pb-32">
        <div className="mb-4 text-[18px] font-semibold text-neutral-900">
          {today.getMonth() + 1}월 {today.getDate()}일{" "}
          {["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}
        </div>
        <div className="flex items-start justify-end">
          <TaskBasketButton onClick={handleOpenTaskBasket} />
        </div>
        <div className="text-base text-neutral-500">
          <TimeSlotList slots={timeSlots} />
        </div>
      </div>

      <BottomSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        expanded={isSheetExpanded}
        onExpandedChange={setIsSheetExpanded}
        peekHeight={12}
        expandHeight={35}
        enableDragHandle
        className="pb-[env(safe-area-inset-bottom)]"
      >
        <div className="px-6 pb-6">
          <div className="text-xl font-semibold text-neutral-900">제외된 리스트</div>
        </div>
      </BottomSheet>
    </>
  );
}
