"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import { RETRO_VISIBILITY, type RetroVisibility } from "@/entities/retro";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { HorizontalImageAlbum } from "@/shared/ui/image";
import { RetroContentField, RetroVisibilityToggle } from "@/shared/ui/retro";
import { useToast } from "@/shared/ui/toast";
import { useMutationErrorEffect } from "@/shared/query";

import {
  RETRO_CONTENT_MAX_HELPER_TEXT,
  RETRO_CONTENT_MAX_LENGTH,
  RETRO_CREATE_FORM_DEFAULTS,
  RETRO_MISSING_DAY_PLAN_TOAST_MESSAGE,
  useRetroCreateForm,
  useRetroCreateMutation,
  useRetroWriteImageUpload,
} from "../model";

interface RetroWriteFormProps {
  dateLabel: string;
  dayPlanId: number | null;
  invalidateKeys?: Array<readonly unknown[]>;
  onCreated?: () => void;
}

export function RetroWriteForm({
  dateLabel,
  dayPlanId,
  invalidateKeys = [],
  onCreated,
}: RetroWriteFormProps) {
  const { showToast } = useToast();
  const [isContentOverflow, setIsContentOverflow] = useState(false);

  const form = useRetroCreateForm();
  const {
    register,
    watch,
    setValue,
    canSubmit,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { uploadedImages, isImageUploading, handleImageChange, clearUploadedImages } =
    useRetroWriteImageUpload({ showToast });

  const createRetroMutation = useRetroCreateMutation({
    dayPlanId,
    invalidateKeys,
    onSuccess: () => {
      showToast("회고가 생성되었습니다.", "success");
      reset(RETRO_CREATE_FORM_DEFAULTS);
      clearUploadedImages();
      setIsContentOverflow(false);
      onCreated?.();
    },
  });
  useMutationErrorEffect(createRetroMutation);

  const visibility = watch("visibility") as RetroVisibility;
  const content = watch("content") ?? "";
  const isOpen = visibility === RETRO_VISIBILITY.PUBLIC;
  const previewUrls = uploadedImages.map((image) => image.viewUrl);
  const isUploadDisabled =
    !canSubmit || !dayPlanId || isImageUploading || createRetroMutation.isPending;

  useEffect(() => {
    setValue(
      "imageKeys",
      uploadedImages.map((image) => image.imageKey),
      { shouldValidate: true },
    );
  }, [uploadedImages, setValue]);

  const contentField = register("content");

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;

    if (nextValue.length > RETRO_CONTENT_MAX_LENGTH) {
      setIsContentOverflow(true);
      setValue("content", nextValue.slice(0, RETRO_CONTENT_MAX_LENGTH), {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    if (isContentOverflow) {
      setIsContentOverflow(false);
    }

    setValue("content", nextValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmitRetro = handleSubmit(async (values) => {
    if (!dayPlanId) {
      showToast(RETRO_MISSING_DAY_PLAN_TOAST_MESSAGE, "error");
      return;
    }

    await createRetroMutation.mutateAsync(values);
  });

  const contentHelperText = isContentOverflow
    ? RETRO_CONTENT_MAX_HELPER_TEXT
    : (errors.content?.message ?? undefined);

  return (
    <>
      <section className="px-7 pt-4 pb-28 text-[18px]">
        <h2 className="text-[18px] font-semibold text-black">{dateLabel} 회고</h2>

        <div className="scrollbar-hide mt-6 flex w-full gap-3 overflow-x-auto pb-1">
          {previewUrls.length > 0 ? (
            <HorizontalImageAlbum
              imageUrls={previewUrls}
              tileSize={140}
              imageAltPrefix="회고 업로드 이미지 미리보기"
              scrollAreaLabel="회고 업로드 이미지 미리보기 가로 스크롤"
              enableKeyboardScroll={false}
              className="shrink-0 overflow-visible"
            />
          ) : null}

          <label className="relative h-[160px] w-[160px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#d9d9d9]">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isImageUploading || createRetroMutation.isPending}
              className="sr-only"
              onChange={handleImageChange}
            />
            <span className="absolute inset-0 flex items-center justify-center font-semibold text-black">
              {isImageUploading ? "업로드 중..." : "사진 추가"}
            </span>
          </label>
        </div>

        <RetroContentField
          placeholder="(선택) 내용을 입력하세요."
          className="mt-6"
          value={content}
          name={contentField.name}
          onBlur={contentField.onBlur}
          onChange={handleContentChange}
          invalid={isContentOverflow || Boolean(errors.content)}
          helperText={contentHelperText}
        />

        <div className="mt-5 flex items-center">
          <RetroVisibilityToggle
            checked={isOpen}
            onCheckedChange={(next) =>
              setValue("visibility", next ? RETRO_VISIBILITY.PUBLIC : RETRO_VISIBILITY.PRIVATE, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>
      </section>

      <FixedActionBar>
        <PrimaryButton
          type="button"
          onClick={() => void handleSubmitRetro()}
          disabled={isUploadDisabled}
        >
          {createRetroMutation.isPending ? "업로드 중..." : "업로드"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
