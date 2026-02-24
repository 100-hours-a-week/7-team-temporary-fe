import type { RetroVisibility } from "@/entities/retro";

export interface RetroCreateFormModel {
  imageKeys: string[];
  content: string;
  visibility: RetroVisibility;
}

export interface RetroCreateRequestDto {
  reflectionImageKeys: string[];
  content: string;
  isOpen: boolean;
}

export interface UploadedRetroImage {
  imageKey: string;
  viewUrl: string;
}
