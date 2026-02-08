"use client";

import type { CSSProperties } from "react";

import { ShinyText } from "@/shared/ui";
import { Icon } from "@/shared/ui/icon";

import { useHomePlanner } from "../model/useHomePlanner";
import { HomeTaskItem } from "./HomeTaskItem";
import { WeekDateSelector } from "./WeekDateSelector";
import { WeekHeader } from "./WeekHeader";
import { WeekdayLabels } from "./WeekdayLabels";

interface HomePlannerProps {
  refreshKey?: number;
}

export function HomePlanner({ refreshKey }: HomePlannerProps) {
  const {
    today,
    weekDays,
    headerMonthIndex,
    selectedDate,
    setSelectedDate,
    todayScheduleLabel,
    tasks,
    statusMessage,
    currentTask,
    currentTaskStatus,
    handleToggleComplete,
    handleMoveWeek,
    hasPlan,
    hasMore,
    isLoading,
    loadMoreRef,
    isCurrentTaskLoading,
  } = useHomePlanner({ refreshKey });

  return (
    <div className="scrollbar-hide mx-0 h-full overflow-y-auto px-5 py-5">
      <WeekHeader
        monthIndex={headerMonthIndex}
        onPrev={() => handleMoveWeek(-7)}
        onNext={() => handleMoveWeek(7)}
      />

      <WeekdayLabels />

      <WeekDateSelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        today={today}
        onSelect={setSelectedDate}
        hasPlan={hasPlan}
      />
      <div className="mt-6 flex flex-col gap-3">
        <section className="1px border-ink-100 rounded-[15px] border border-solid bg-white px-4 py-4">
          <div className="text-primary-600 flex items-center gap-2 pb-1 text-base font-bold">
            <Icon
              name="fire"
              className="h-7 w-7"
              aria-hidden
            />
            <ShinyText
              text="지금 할 일"
              className="text-base font-bold"
              color="var(--color-primary-600)"
              shineColor="var(--color-primary-200)"
              speed={3}
              delay={1.5}
              spread={30}
            />
          </div>
          <div className="mt-2">
            {isCurrentTaskLoading ? (
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-neutral-100" />
                </div>
              </div>
            ) : currentTaskStatus ? (
              <div
                className={`text rounded-2xl bg-white px-6 py-6 text-center text-sm ${currentTaskStatus.className}`}
              >
                {currentTaskStatus.text}
              </div>
            ) : currentTask ? (
              <HomeTaskItem
                task={currentTask}
                onToggleComplete={handleToggleComplete}
                className="text-primary-600 border-0 p-0 pl-1.5"
                iconClassName="text-primary-600"
              />
            ) : null}
          </div>
        </section>
        <section className="1px border-ink-100 rounded-[15px] border border-solid bg-white px-4 py-4">
          <div className="text-primary-600 flex items-center gap-2 pb-1 text-base font-bold">
            <Icon
              name="home_outline"
              className="h-7 w-7"
              style={{ "--icon-stroke": 3 } as CSSProperties}
              aria-hidden
            />
            {todayScheduleLabel}
          </div>
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-neutral-100" />
                  <div className="h-3 w-2/5 animate-pulse rounded-full bg-neutral-100" />
                </div>
              </div>
            ) : statusMessage ? (
              <div
                className={`rounded-2xl bg-white px-4 py-6 text-center text-sm ${statusMessage.className}`}
              >
                {statusMessage.text}
              </div>
            ) : (
              <>
                {tasks.map((task, index) => (
                  <div
                    key={task.taskId}
                    className="task-card-enter"
                    style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                  >
                    <HomeTaskItem
                      task={task}
                      variant="list"
                      onToggleComplete={handleToggleComplete}
                    />
                  </div>
                ))}
                <div
                  ref={loadMoreRef}
                  className="h-px"
                />
                {isLoading && hasMore ? (
                  <div className="text-center text-xs text-neutral-400">불러오는 중...</div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
      <div
        className="h-24"
        aria-hidden
      />
    </div>
  );
}
