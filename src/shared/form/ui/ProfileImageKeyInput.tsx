import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui";
import Image from "next/image";

interface ProfileImageKeyInputProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
  invalid?: boolean;
  previewUrl?: string | null;
  onFileSelect?: (file: File | null) => void | Promise<void>;
  onUploadError?: (error: unknown) => void;
}

export function ProfileImageKeyInput({
  register,
  isDisabled,
  invalid,
  previewUrl,
  onFileSelect,
  onUploadError,
}: ProfileImageKeyInputProps) {
  const inputId = register.name;
  const { onChange: _ignoredOnChange, ...registerProps } = register;

  //파일 선택 시 실행되는 핸들러
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null; //사용자가 선택한 file
    //외부에서 파일 선택 감지
    try {
      await onFileSelect?.(file);
    } catch (error) {
      onUploadError?.(error);
      if (!onUploadError) {
        console.error("프로필 이미지 업로드 실패:", error);
      }
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-28 w-28 items-center justify-center rounded-full",
        "data-[invalid=true]:ring-error/20 data-[invalid=true]:ring-2",
      )}
      data-invalid={invalid || undefined}
    >
      <input
        type="hidden"
        {...registerProps}
      />
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only text-[rgba(112,112,112,1)]"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
      <Icon
        name="edit"
        className="absolute right-0 bottom-0 z-10 h-8 w-8 rounded-full bg-[var(--color-neutral-800)] p-1.5 text-white shadow-md"
      />
      {previewUrl ? (
        <label
          className={cn(
            "flex w-full items-center justify-center rounded-xl border-0 bg-transparent",
            "data-[invalid=true]:ring-error/20 data-[invalid=true]:ring-2",
          )}
          htmlFor={inputId}
          aria-label="이미지 다시 선택하기"
        >
          <Image
            src={previewUrl}
            alt="선택한 이미지 미리보기"
            width={120}
            height={120}
            className="h-28 w-28 rounded-full object-cover"
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
        ></label>
      )}
    </div>
  );
}
