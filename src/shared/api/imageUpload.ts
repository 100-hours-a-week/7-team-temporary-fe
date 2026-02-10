import { apiFetch } from "./apiFetch";
import { Endpoint } from "./endpoints";

export type ImageType = "USERS" | "REFLECTIONS" | "MESSAGES";

interface PresignedUploadUrlResponse {
  uploadUrl: string;
  imageKey: string;
  expiresAt: string;
}

interface ImageViewUrlResponse {
  url: string;
  expiresAt: string;
  imageKey: string;
}

export async function requestPresignedUrl(type: ImageType) {
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
}

export async function uploadToPresignedUrl(uploadUrl: string, file: File) {
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
}

export async function requestImageViewUrl(imageKey: string, type: ImageType) {
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
}

export async function uploadImageAndResolveViewUrl(file: File, type: ImageType) {
  const { uploadUrl, imageKey } = await requestPresignedUrl(type);
  await uploadToPresignedUrl(uploadUrl, file);
  const viewUrl = await requestImageViewUrl(imageKey, type);

  return {
    imageKey,
    viewUrl,
  };
}
