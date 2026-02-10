import type { RetroVisibility } from "@/entities/retro";

export interface RetroCreateFormModel {
  reflectionImageIds: number[];
  content: string;
  visibility: RetroVisibility;
}

export interface RetroCreateRequestDto {
  reflectionImageIds: number[];
  content: string;
}
