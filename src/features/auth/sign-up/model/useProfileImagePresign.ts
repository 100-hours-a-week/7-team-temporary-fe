import { useCallback, useState } from "react";

import { apiFetch, Endpoint } from "@/shared/api";

type PresignedUploadUrlResponse = {
  url?: string;
  presignedUrl?: string;
};

type PresignedUploadUrlRequest = {
  fileName: string;
  contentType: string;
};

export const useProfileImagePresign = () => {
  const [presignedUploadUrl, setPresignedUploadUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<unknown>(null);

  const getPresignedUploadUrl = useCallback(async (file: File) => {
    const payload: PresignedUploadUrlRequest = {
      fileName: file.name,
      contentType: file.type,
    };
    const response = await apiFetch<PresignedUploadUrlResponse | string, PresignedUploadUrlRequest>(
      Endpoint.UPLOAD.PRESIGNED_URL("USERS"),
      {
        method: "POST",
        body: payload,
      },
    );
    console.log(response);
    const url = typeof response === "string" ? response : (response.url ?? response.presignedUrl);
    if (!url) {
      throw new Error("프리사인 URL 응답에 url이 없습니다.");
    }
    console.log(url);
    return url;
  }, []);

  const handlePresignedUploadUrlChange = useCallback((url: string | null) => {
    setPresignedUploadUrl(url);
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedImageFile(file);
  }, []);

  const handleUploadError = useCallback((error: unknown) => {
    setUploadError(error);
  }, []);

  return {
    getPresignedUploadUrl,
    presignedUploadUrl,
    selectedImageFile,
    uploadError,
    handlePresignedUploadUrlChange,
    handleFileSelect,
    handleUploadError,
  };
};
