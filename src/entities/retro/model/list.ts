export const RETRO_SECTION = {
  MY_PAGE: "MY_PAGE",
  EXPLORE: "EXPLORE",
} as const;

export type RetroSection = (typeof RETRO_SECTION)[keyof typeof RETRO_SECTION];

export interface RetroListItem {
  id: number;
  dateLabel: string;
  timeLabel: string;
  imageUrls: string[];
  content: string;
  likeCount: number;
  defaultLiked?: boolean;
  visibilityText: string;
}
