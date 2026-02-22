export const RETRO_SECTION = {
  MY_PAGE: "MY_PAGE",
  EXPLORE: "EXPLORE",
} as const;

export type RetroSection = (typeof RETRO_SECTION)[keyof typeof RETRO_SECTION];

export interface RetroCoreItem {
  id: number;
  dateLabel: string;
  timeLabel: string;
  imageUrls: string[];
  content: string;
  likeCount: number;
  defaultLiked?: boolean;
  isMine: boolean;
}

export interface MyRetroCardVM extends RetroCoreItem {
  visibilityText: string;
}

export interface PublicRetroCardVM extends RetroCoreItem {
  authorNickname: string;
}

export type RetroListItem = MyRetroCardVM | PublicRetroCardVM;

export interface MyRetroListModel {
  content: MyRetroCardVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
