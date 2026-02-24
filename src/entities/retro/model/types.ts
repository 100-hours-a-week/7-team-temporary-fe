export const RETRO_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type RetroVisibility = (typeof RETRO_VISIBILITY)[keyof typeof RETRO_VISIBILITY];

export const RETRO_VISIBILITY_LABEL: Record<RetroVisibility, string> = {
  PUBLIC: "공개",
  PRIVATE: "비공개",
};
