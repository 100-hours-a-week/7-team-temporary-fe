import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui";

interface ProfileImageKeyInputProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
  invalid?: boolean;
  previewUrl?: string | null;
  getPresignedUploadUrl?: (file: File) => Promise<string>;
  onPresignedUploadUrlChange?: (url: string | null) => void;
  onFileSelect?: (file: File | null) => void;
  onUploadError?: (error: unknown) => void;
}

export function ProfileImageKeyInput({
  register,
  isDisabled,
  invalid,
  previewUrl,
  getPresignedUploadUrl,
  onPresignedUploadUrlChange,
  onFileSelect,
  onUploadError,
}: ProfileImageKeyInputProps) {
  const inputId = register.name;
  const { onChange: handleRegisterChange, ...registerProps } = register;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // react-hook-form에 변경을 알리고 미리보기 URL을 갱신합니다.
    handleRegisterChange(event);
    const file = event.target.files?.[0] ?? null; //사용자가 선택한 file

    onFileSelect?.(file);
    onPresignedUploadUrlChange?.(null);

    if (!file || !getPresignedUploadUrl) return;

    try {
      const url = await getPresignedUploadUrl(file);
      onPresignedUploadUrlChange?.(url);
    } catch (error) {
      onUploadError?.(error);
      if (!onUploadError) {
        console.error("프리사인 URL 요청 실패:", error);
      }
    }
  };

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 [background-clip:unset] text-[rgba(64,64,64,1)] [-webkit-background-clip:unset]"
      data-invalid={invalid || undefined}
    >
      <input
        {...registerProps}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only text-[rgba(112,112,112,1)]"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
      {previewUrl ? (
        <label
          className={cn(
            "flex w-full items-center justify-center rounded-xl border-0 bg-transparent p-4",
            "data-[invalid=true]:ring-error/20 data-[invalid=true]:ring-2",
          )}
          htmlFor={inputId}
          aria-label="이미지 다시 선택하기"
        >
          <img
            src={previewUrl}
            alt="선택한 이미지 미리보기"
            className="h-24 w-24 rounded-full object-cover"
          />
        </label>
      ) : (
        <label
          className={cn(
            "relative flex h-[110px] w-[110px] items-center justify-center gap-2 rounded-full border-0 bg-[var(--color-neutral-200)] p-0 text-sm text-gray-600",
            "data-[invalid=true]:border-error data-[invalid=true]:text-error",
            "data-[invalid=true]:ring-error/20 data-[invalid=true]:ring-2",
          )}
          htmlFor={inputId}
        >
          <Icon
            name="edit"
            className="absolute right-[10px] bottom-0 h-5 w-5 rounded-[500px] bg-[var(--color-neutral-800)] p-[13px] text-white"
          />
        </label>
      )}
    </div>
  );
}
