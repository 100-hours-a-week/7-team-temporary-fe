"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { RETRO_VISIBILITY, RETRO_VISIBILITY_LABEL, type RetroVisibility } from "@/entities/retro";
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
  const objectUrlsRef = useRef<string[]>([]);
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

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextPreviewUrls = files.map((file) => URL.createObjectURL(file));
    objectUrlsRef.current.push(...nextPreviewUrls);
    setPreviewUrls((prev) => [...prev, ...nextPreviewUrls]);

    // TODO: 이미지 업로드 API 연동 시 업로드 완료된 imageId 목록을 setValue로 반영
    setValue("reflectionImageIds", [], { shouldValidate: true, shouldDirty: true });
    event.target.value = "";
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
              className="sr-only"
              onChange={handleImageChange}
            />
            <span className="absolute inset-0 flex items-center justify-center font-semibold text-black">
              사진 추가
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
          disabled={!hasPayload || !canSubmit || createRetroMutation.isPending}
        >
          {createRetroMutation.isPending ? "업로드 중..." : "업로드"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
