export const IMAGE_FILE_ERRORS = {
  INVALID_TYPE: "jpg 또는 png 이미지 파일만 업로드할 수 있습니다.",
  INVALID_SIZE: "이미지 파일은 10MB 이하만 업로드할 수 있습니다.",
} as const;

export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const DEFAULT_MAX_DIMENSION = 2048;
const JPEG_QUALITY_STEPS = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65];

export const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return IMAGE_FILE_ERRORS.INVALID_TYPE;
  }
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return IMAGE_FILE_ERRORS.INVALID_SIZE;
  }
  return undefined;
};

const loadBitmap = async (file: File) => {
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(file);
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드에 실패했습니다."));
    };
    image.src = url;
  });
};

const drawToCanvas = (
  source: CanvasImageSource,
  width: number,
  height: number,
  backgroundColor?: string,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("이미지 처리에 실패했습니다.");
  }
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 변환에 실패했습니다."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });

const getResizedDimensions = (width: number, height: number, maxDimension: number) => {
  const scale = Math.min(1, maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
};

export const prepareImageFile = async (file: File) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error(IMAGE_FILE_ERRORS.INVALID_TYPE);
  }
  if (file.size <= MAX_IMAGE_FILE_SIZE_BYTES) {
    return file;
  }

  const bitmap = await loadBitmap(file);
  const { width, height, scale } = getResizedDimensions(
    bitmap.width,
    bitmap.height,
    DEFAULT_MAX_DIMENSION,
  );
  const canvas = drawToCanvas(bitmap, width, height);

  let targetType = file.type;
  let blob: Blob | null = null;

  if (targetType === "image/jpeg") {
    for (const quality of JPEG_QUALITY_STEPS) {
      blob = await toBlob(canvas, targetType, quality);
      if (blob.size <= MAX_IMAGE_FILE_SIZE_BYTES) break;
    }
  } else {
    blob = await toBlob(canvas, targetType);
    if (blob.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      const jpegCanvas = drawToCanvas(bitmap, width, height, "#ffffff");
      targetType = "image/jpeg";
      for (const quality of JPEG_QUALITY_STEPS) {
        blob = await toBlob(jpegCanvas, targetType, quality);
        if (blob.size <= MAX_IMAGE_FILE_SIZE_BYTES) break;
      }
    }
  }

  if ("close" in bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }

  if (!blob || blob.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error(IMAGE_FILE_ERRORS.INVALID_SIZE);
  }

  const baseName = file.name || "profile-image";
  const nextName =
    targetType === "image/jpeg" && baseName.toLowerCase().endsWith(".png")
      ? baseName.replace(/\.png$/i, ".jpg")
      : targetType === "image/jpeg" && !baseName.toLowerCase().endsWith(".jpg")
        ? `${baseName}.jpg`
        : baseName;
  return new File([blob], nextName, { type: blob.type, lastModified: Date.now() });
};
