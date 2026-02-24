import { useCallback, useState } from "react";

import { requestImageViewUrl, uploadImageAndResolveViewUrl, type ImageType } from "@/shared/api";

interface UseImageUploadOptions {
  imageType?: ImageType;
}

export const useImageUpload = ({ imageType = "USERS" }: UseImageUploadOptions = {}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  const handleFileSelect = useCallback(
    async (file: File | null) => {
      setUploadError(null);

      if (!file) {
        setPreviewUrl(null);
        setImageKey(null);
        return;
      }

      setIsUploading(true);

      try {
        const uploaded = await uploadImageAndResolveViewUrl(file, imageType);

        setPreviewUrl(uploaded.viewUrl);
        setImageKey(uploaded.imageKey);
      } catch (error) {
        setUploadError(error);
        setPreviewUrl(null);
        setImageKey(null);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [imageType],
  );

  const restoreImageState = useCallback(
    (next: { imageKey: string; previewUrl?: string | null }) => {
      setUploadError(null);
      setImageKey(next.imageKey);
      setPreviewUrl(next.previewUrl ?? null);
    },
    [],
  );

  const loadImageViewUrl = useCallback(
    async (nextImageKey: string, type: ImageType = imageType) => {
      setUploadError(null);
      const viewUrl = await requestImageViewUrl(nextImageKey, type);
      setPreviewUrl(viewUrl);
      return viewUrl;
    },
    [imageType],
  );

  return {
    previewUrl,
    imageKey,
    isUploading,
    uploadError,
    handleFileSelect,
    restoreImageState,
    loadImageViewUrl,
  };
};
