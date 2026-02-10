"use client";

import { useState, type ChangeEvent } from "react";

import { RETRO_VISIBILITY, RETRO_VISIBILITY_LABEL, type RetroVisibility } from "@/entities/retro";
import { uploadImageAndResolveViewUrl } from "@/shared/api";
import { ActionButton, FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { HorizontalImageAlbum } from "@/shared/ui/image";
import { useToast } from "@/shared/ui/toast";
import { useMutationErrorEffect } from "@/shared/query";

import { useRetroCreateForm, useRetroCreateMutation } from "../model";

interface RetroWriteFormProps {
  dateLabel: string;
}

export function RetroWriteForm({ dateLabel }: RetroWriteFormProps) {
  const { showToast } = useToast();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const createRetroMutation = useRetroCreateMutation({
    onSuccess: () => {
      showToast("회고가 생성되었습니다.", "success");
    },
  });
  useMutationErrorEffect(createRetroMutation);

  const form = useRetroCreateForm({
    onValid: (values) => {
      createRetroMutation.mutate(values);
    },
  });
  const { register, watch, setValue, submitForm, canSubmit } = form;

  const visibility = watch("visibility") as RetroVisibility;
  const content = watch("content");
  const reflectionImageIds = watch("reflectionImageIds");
  const isPublic = visibility === RETRO_VISIBILITY.PUBLIC;
  const hasPayload =
    content.trim().length > 0 || reflectionImageIds.length > 0 || previewUrls.length > 0;

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsImageUploading(true);

    try {
      const uploadResults = await Promise.allSettled(
        files.map((file) => uploadImageAndResolveViewUrl(file, "REFLECTIONS")),
      );

      const uploaded = uploadResults
        .filter(
          (result): result is PromiseFulfilledResult<{ imageKey: string; viewUrl: string }> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (uploaded.length > 0) {
        setPreviewUrls((prev) => [...prev, ...uploaded.map((item) => item.viewUrl)]);
      }

      // TODO: 이미지 업로드 응답 스펙 확정 후 imageKey -> reflectionImageId 매핑 반영
      setValue("reflectionImageIds", [], { shouldValidate: true, shouldDirty: true });

      const failedCount = uploadResults.length - uploaded.length;
      if (failedCount > 0) {
        showToast(`이미지 ${failedCount}개 업로드에 실패했습니다.`, "error");
      }
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <section className="px-6 pt-4 pb-28 text-[18px]">
        <h2 className="text-[18px] font-semibold text-black">{dateLabel} 회고</h2>

        <div className="scrollbar-hide mt-6 flex w-full gap-3 overflow-x-auto pb-1">
          {previewUrls.length > 0 ? (
            <HorizontalImageAlbum
              imageUrls={previewUrls}
              tileSize={160}
              imageAltPrefix="회고 업로드 이미지 미리보기"
              className="shrink-0"
            />
          ) : null}

          <label className="relative h-[160px] w-[160px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#d9d9d9]">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isImageUploading}
              className="sr-only"
              onChange={handleImageChange}
            />
            <span className="absolute inset-0 flex items-center justify-center font-semibold text-black">
              {isImageUploading ? "업로드 중..." : "사진 추가"}
            </span>
          </label>
        </div>

        <textarea
          placeholder="(선택) 내용을 입력하세요."
          className="mt-6 h-[178px] w-full resize-none rounded-2xl border border-[#d8d8d8] bg-[#f7f7f7] px-4 py-4 text-[16px] text-black outline-none placeholder:text-[16px] placeholder:text-[#bdbdbd]"
          {...register("content")}
        />

        <div className="mt-5 flex items-center">
          <ActionButton
            buttonText={RETRO_VISIBILITY_LABEL[visibility]}
            aria-pressed={isPublic}
            onClick={() =>
              setValue(
                "visibility",
                visibility === RETRO_VISIBILITY.PUBLIC
                  ? RETRO_VISIBILITY.PRIVATE
                  : RETRO_VISIBILITY.PUBLIC,
                { shouldValidate: true, shouldDirty: true },
              )
            }
            className={`my-0 h-8 w-[80px] items-center px-0 py-0 text-[18px] leading-none font-semibold whitespace-nowrap transition-colors ${
              isPublic
                ? "border-primary-700 text-primary-700 bg-[#fff5f5]"
                : "border-[#dbdbdb] bg-[#dddddd] text-[#9a9a9a]"
            }`}
          />
        </div>
      </section>

      <FixedActionBar>
        <PrimaryButton
          type="button"
          onClick={() => void submitForm()}
          disabled={!hasPayload || !canSubmit || isImageUploading || createRetroMutation.isPending}
        >
          {createRetroMutation.isPending ? "업로드 중..." : "업로드"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
