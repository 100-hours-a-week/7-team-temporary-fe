import type {
  MyRetroItemResponseDto,
  MyRetroListResponseDto,
  PublicRetroItemResponseDto,
  PublicRetroListResponseDto,
} from "../api";

import type {
  MyRetroCardVM,
  MyRetroListModel,
  PublicRetroCardVM,
  PublicRetroListModel,
} from "./list";

const DEFAULT_TIME_LABEL = "--:--";
const DEFAULT_DATE_LABEL = "날짜 미정";
const DEFAULT_VISIBILITY_TEXT = "비공개";
const PUBLIC_VISIBILITY_TEXT = "전체 공개";

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

function toPublicRetroCardVM(item: PublicRetroItemResponseDto): PublicRetroCardVM {
  return {
    id: item.reflectionId,
    dateLabel: formatDateLabel(item.createdAt, item.title),
    timeLabel: formatTimeLabel(item.createdAt),
    imageUrls: (item.images ?? []).map((image) => image.url).filter((url): url is string => !!url),
    content: item.content ?? "",
    likeCount: item.likes ?? 0,
    isMine: item.isMine ?? false,
    authorNickname: item.ownerNickname ?? item.onwerNickname ?? "알 수 없음",
  };
}

export function toMyRetroListModel(dto: MyRetroListResponseDto): MyRetroListModel {
  return {
    content: dto.content.map(toMyRetroCardVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}

export function toPublicRetroListModel(dto: PublicRetroListResponseDto): PublicRetroListModel {
  return {
    content: dto.content.map(toPublicRetroCardVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
