import type { MyRetroListResponseDto, MyRetroItemResponseDto } from "../api";

import type { MyRetroCardVM, MyRetroListModel } from "./list";

const DEFAULT_TIME_LABEL = "--:--";
const DEFAULT_DATE_LABEL = "날짜 미정";
const DEFAULT_VISIBILITY_TEXT = "비공개";
const PUBLIC_VISIBILITY_TEXT = "전체 공개";

function toTimestamp(value?: string) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDateLabel(createdAt?: string, fallbackTitle?: string) {
  if (!createdAt) return fallbackTitle ?? DEFAULT_DATE_LABEL;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return fallbackTitle ?? DEFAULT_DATE_LABEL;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function formatTimeLabel(createdAt?: string) {
  if (!createdAt) return DEFAULT_TIME_LABEL;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return DEFAULT_TIME_LABEL;

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function toMyRetroCardVM(item: MyRetroItemResponseDto): MyRetroCardVM {
  return {
    id: item.reflectionId,
    dateLabel: formatDateLabel(item.createdAt, item.title),
    timeLabel: formatTimeLabel(item.createdAt),
    imageUrls: (item.images ?? []).map((image) => image.url).filter((url): url is string => !!url),
    content: item.content ?? "",
    likeCount: item.likes ?? 0,
    isMine: item.isMine ?? true,
    visibilityText: item.isOpen ? PUBLIC_VISIBILITY_TEXT : DEFAULT_VISIBILITY_TEXT,
  };
}

export function toMyRetroListModel(dto: MyRetroListResponseDto): MyRetroListModel {
  const sorted = [...dto.content].sort(
    (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt),
  );

  return {
    content: sorted.map(toMyRetroCardVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
