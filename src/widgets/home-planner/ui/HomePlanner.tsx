"use client";

import { Profiler, useCallback } from "react";
import type { CSSProperties, ProfilerOnRenderCallback } from "react";

import { SectionCard, ShinyText } from "@/shared/ui";
import { SectionActionButton } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { HomeTaskItem } from "@/entities/day-plan-schedule";
import { useHomePlanner } from "@/features/home";
import { HomeWeekSelector } from "@/widgets/home-week";

interface HomePlannerProps {
  enabled?: boolean;
  onWeeklyReportClick?: () => void;
}

export function HomePlanner({ enabled = true, onWeeklyReportClick }: HomePlannerProps) {
  const handlePlannerProfileRender = useCallback<ProfilerOnRenderCallback>(
    (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      if (typeof window !== "undefined" && (window as any).__MOLIP_PROFILE_CAPTURE__) {
        const currentEntries = Array.isArray((window as any).__MOLIP_PROFILE_ENTRIES__)
          ? (window as any).__MOLIP_PROFILE_ENTRIES__
          : [];
        currentEntries.push({
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        });
        (window as any).__MOLIP_PROFILE_ENTRIES__ = currentEntries;
      }

      if (process.env.NODE_ENV !== "development") return;
      console.log(
        `[Profiler:${id}] phase=${phase} actual=${actualDuration.toFixed(2)}ms base=${baseDuration.toFixed(2)}ms start=${startTime.toFixed(2)} commit=${commitTime.toFixed(2)}`,
      );
    },
    [],
  );

  const {
    today,
    weekDays,
    headerMonthIndex,
    selectedDate,
    setSelectedDate,
    todayScheduleLabel,
    isWeeklyReportAvailable,
    tasks,
    statusMessage,
    currentTask,
    currentTaskStatus,
    handleToggleComplete,
    handleMoveWeek,
    hasPlan,
    hasMore,
    isLoading,
    isFetchingMore,
    loadMoreRef,
    isCurrentTaskLoading,
  } = useHomePlanner({ enabled });

  return (
    <Profiler
      id="HomePlanner"
      onRender={handlePlannerProfileRender}
    >
      <div className="scrollbar-hide mx-0 h-full overflow-y-auto px-5 py-5">
        <HomeWeekSelector
          monthIndex={headerMonthIndex}
          weekDays={weekDays}
          selectedDate={selectedDate}
          today={today}
          onSelectDate={setSelectedDate}
          onPrevWeek={() => handleMoveWeek(-7)}
          onNextWeek={() => handleMoveWeek(7)}
          hasPlan={hasPlan}
        />
        <div className="mt-6 flex flex-col gap-3">
          <SectionCard>
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
          </SectionCard>
          <SectionCard>
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="text-primary-600 flex items-center gap-2 text-base font-bold">
                <Icon
                  name="home_outline"
                  className="h-7 w-7"
                  style={{ "--icon-stroke": 3 } as CSSProperties}
                  aria-hidden
                />
                {todayScheduleLabel}
              </div>
              <SectionActionButton
                type="button"
                onClick={onWeeklyReportClick}
                disabled={!isWeeklyReportAvailable}
                aria-label="주간 레포트 페이지 이동"
                icon={
                  <Icon
                    name="weekly_report"
                    className="h-5 w-5"
                    aria-hidden
                  />
                }
              >
                주간 레포트
              </SectionActionButton>
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
                  {isFetchingMore && hasMore ? (
                    <div className="text-center text-xs text-neutral-400">불러오는 중...</div>
                  ) : null}
                </>
              )}
            </div>
          </SectionCard>
        </div>
        <div
          className="h-24"
          aria-hidden
        />
      </div>
    </Profiler>
  );
}
