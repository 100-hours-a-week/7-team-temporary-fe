"use client";

import { useCallback, useState, type ChangeEvent } from "react";

import { uploadImageAndResolveViewUrl } from "@/shared/api";

import { RETRO_IMAGE_MAX_COUNT, RETRO_IMAGE_MAX_TOAST_MESSAGE } from "./retroWrite.constants";
import type { UploadedRetroImage } from "./types";

type ShowToast = (message: string, type?: "info" | "success" | "error") => void;

interface UseRetroWriteImageUploadOptions {
  showToast: ShowToast;
}

export function useRetroWriteImageUpload({ showToast }: UseRetroWriteImageUploadOptions) {
  const [uploadedImages, setUploadedImages] = useState<UploadedRetroImage[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length === 0) return;

      const remainingSlots = RETRO_IMAGE_MAX_COUNT - uploadedImages.length;

      if (remainingSlots <= 0) {
        showToast(RETRO_IMAGE_MAX_TOAST_MESSAGE, "error");
        event.target.value = "";
        return;
      }

      const uploadCandidates = files.slice(0, remainingSlots);
      if (files.length > uploadCandidates.length) {
        showToast(RETRO_IMAGE_MAX_TOAST_MESSAGE, "error");
      }

      setIsImageUploading(true);

      try {
        const uploadResults = await Promise.allSettled(
          uploadCandidates.map((file) => uploadImageAndResolveViewUrl(file, "REFLECTIONS")),
        );

        const uploaded = uploadResults
          .filter(
            (result): result is PromiseFulfilledResult<UploadedRetroImage> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value);

        if (uploaded.length > 0) {
          setUploadedImages((prev) => [...prev, ...uploaded]);
        }

        const failedCount = uploadResults.length - uploaded.length;
        if (failedCount > 0) {
          showToast(`이미지 ${failedCount}개 업로드에 실패했습니다.`, "error");
        }
      } finally {
        setIsImageUploading(false);
        event.target.value = "";
      }
    },
    [showToast, uploadedImages.length],
  );

  return {
    uploadedImages,
    isImageUploading,
    handleImageChange,
    clearUploadedImages: () => setUploadedImages([]),
  };
}
