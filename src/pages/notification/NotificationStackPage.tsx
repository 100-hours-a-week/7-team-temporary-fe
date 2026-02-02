"use client";

import { useEffect, useMemo } from "react";

import { useStackPage } from "@/widgets/stack";
import { useNotificationsQuery, type NotificationItemDto } from "@/entities/notification";

const PAGE_SIZE = 10;

const getNotificationTitle = (item: NotificationItemDto) =>
  item.title ?? item.content ?? item.body ?? "알림";

const getNotificationDescription = (item: NotificationItemDto) => {
  const base = item.body ?? item.content;
  if (!base || base === item.title) return null;
  return base;
};

const formatNotificationDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function NotificationStackPage() {
  const { setHeaderContent } = useStackPage();
  const { data, isLoading, isError } = useNotificationsQuery({ page: 1, size: PAGE_SIZE });

  const notifications = useMemo(() => data?.content ?? [], [data?.content]);

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">알림</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="px-6 pt-[13px] pb-32">
      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          알림을 불러오는 중...
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          알림을 불러오지 못했습니다.
        </div>
      ) : null}
      {!isLoading && !isError && notifications.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          아직 받은 알림이 없습니다.
        </div>
      ) : null}
      <div className="flex flex-col gap-5">
        {notifications.map((item, index) => {
          const title = getNotificationTitle(item);
          const description = getNotificationDescription(item);
          const sentAt = formatNotificationDate(item.sentAt ?? item.createdAt);
          const key = item.notificationId ?? item.id ?? `${index}-${title}`;

          return (
            <div key={key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-base font-medium text-neutral-900">
                    <span>{title}</span>
                    {sentAt ? <div className="text-xs text-neutral-400">{sentAt}</div> : null}
                  </div>
                  {description ? (
                    <div className="mt-1 text-sm text-neutral-400">{description}</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
