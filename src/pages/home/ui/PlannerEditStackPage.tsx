"use client";

import { useEffect, useMemo } from "react";

import { useStackPage } from "@/widgets/stack";
import { END_HOUR, START_HOUR, TaskBasketButton, TimeSlotList } from "@/features/home";
import { TaskBasketStackPage } from "./TaskBasketStackPage";

export function PlannerEditStackPage() {
  const { push, setHeaderContent } = useStackPage();
  const today = useMemo(() => new Date(), []);

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
    <div className="px-6 py-8">
      <div className="mb-4 text-2xl font-semibold text-neutral-900">
        {today.getMonth() + 1}월 {today.getDate()}일{" "}
        {["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}
      </div>
      <div className="flex justify-end">
        <TaskBasketButton onClick={handleOpenTaskBasket} />
      </div>
      <div className="text-base text-neutral-500">
        <TimeSlotList slots={timeSlots} />
      </div>
    </div>
  );
}
