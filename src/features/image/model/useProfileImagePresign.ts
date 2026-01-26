import { useCallback, useState } from "react";
import { apiFetch, Endpoint } from "@/shared/api";

export type ImageType = "USERS" | "REFLECTIONS" | "MESSAGES";

type PresignedUploadUrlResponse = {
  uploadUrl: string;
  imageKey: string;
  expiresAt: string;
};

type ImageViewUrlResponse = {
  url: string;
  expiresAt: string;
  imageKey: string;
};

/**
 * 프로필 이미지 업로드 훅
 */
export const useProfileImageUpload = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  /**
   * Presigned 업로드 URL 발급
   */
  const requestPresignedUploadUrl = useCallback(async (type: ImageType) => {
    const data = await apiFetch<PresignedUploadUrlResponse>(
      `${Endpoint.IMAGES.PRESIGNED_URL}?type=${type}`,
      {
        method: "POST",
      },
    );

    if (!data.uploadUrl || !data.imageKey) {
      throw new Error("프리사인 URL 응답이 올바르지 않습니다.");
    }

    return data;
  }, []);

  /**
   * S3 업로드
   */
  const uploadToS3 = useCallback(async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("이미지 업로드에 실패했습니다.");
    }
  }, []);

  /**
   * 파일 선택 핸들러
   */
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
        // 1. 프리사인 URL 요청
        const { uploadUrl, imageKey } = await requestPresignedUploadUrl("USERS");
        // 2. S3 업로드
        await uploadToS3(uploadUrl, file);
        // 3. 이미지 조회 URL 요청
        const viewUrl = await requestImageViewUrl(imageKey, "USERS");

        setPreviewUrl(viewUrl);
        setImageKey(imageKey);
      } catch (error) {
        setUploadError(error);
        setPreviewUrl(null);
        setImageKey(null);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [requestPresignedUploadUrl, uploadToS3],
  );

  /**
   *조회 이미지 뷰 URL 요청
   */
  const requestImageViewUrl = useCallback(async (imageKey: string, type: ImageType) => {
    const data = await apiFetch<ImageViewUrlResponse>(
      `${Endpoint.IMAGES.VIEW(imageKey)}?type=${type}`,
      {
        method: "GET",
      },
    );

    if (!data.url) {
      throw new Error("이미지 조회 URL이 없습니다.");
    }

    return data.url;
  }, []);

  return {
    previewUrl,
    imageKey,
    isUploading,
    uploadError,
    handleFileSelect,
  };
};
