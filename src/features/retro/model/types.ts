import type { RetroVisibility } from "@/entities/retro";

export interface RetroCreateFormModel {
  reflectionImageIds: number[];
  uploadedImageKeys: string[];
  content: string;
  visibility: RetroVisibility;
}

export interface RetroCreateRequestDto {
  reflectionImageIds: number[];
  content: string;
  isPublic: boolean;
}

export interface UploadedRetroImage {
  imageKey: string;
  viewUrl: string;
}
