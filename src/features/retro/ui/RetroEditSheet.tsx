"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { type MyRetroCardVM, retroQueryKeys } from "@/entities/retro";
import { PrimaryButton } from "@/shared/ui/button/primary";
import { BottomSheet } from "@/shared/ui/bottom-sheet/bottom-sheet";
import { HorizontalImageAlbum } from "@/shared/ui/image";
import { RetroContentField, RetroVisibilityToggle } from "@/shared/ui/retro";
import { useToast } from "@/shared/ui/toast";
import { useMutationErrorEffect } from "@/shared/query";

import {
  RETRO_CONTENT_MAX_LENGTH,
  RETRO_CONTENT_MAX_HELPER_TEXT,
  RETRO_IMAGE_MAX_COUNT,
  RETRO_IMAGE_MAX_TOAST_MESSAGE,
  useRetroUpdateMutation,
  useRetroWriteImageUpload,
} from "../model";

const retroEditSchema = z.object({
  content: z.string().max(RETRO_CONTENT_MAX_LENGTH, RETRO_CONTENT_MAX_HELPER_TEXT),
  isOpen: z.boolean(),
});

type RetroEditFormValues = z.infer<typeof retroEditSchema>;

interface RetroEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retro: MyRetroCardVM | null;
  invalidateKeys?: Array<readonly unknown[]>;
}

export function RetroEditSheet({ open, onOpenChange, retro, invalidateKeys }: RetroEditSheetProps) {
  const { showToast } = useToast();
  const [isContentOverflow, setIsContentOverflow] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RetroEditFormValues>({
    resolver: zodResolver(retroEditSchema),
    mode: "onChange",
    values: retro
      ? { content: retro.content, isOpen: retro.isOpen }
      : { content: "", isOpen: true },
  });

  const { uploadedImages, isImageUploading, handleImageChange, clearUploadedImages } =
    useRetroWriteImageUpload({ showToast });

  const updateMutation = useRetroUpdateMutation({
    invalidateKeys: invalidateKeys ?? [retroQueryKeys.myListAll(), retroQueryKeys.publicListAll()],
    onSuccess: () => {
      showToast("회고가 수정되었습니다.", "success");
      clearUploadedImages();
      onOpenChange(false);
    },
  });
  useMutationErrorEffect(updateMutation);

  const content = watch("content") ?? "";
  const isOpen = watch("isOpen");

  const existingImageUrls = retro?.imageUrls ?? [];
  const existingImageKeys = retro?.imageKeys ?? [];
  const newImageUrls = uploadedImages.map((img) => img.viewUrl);
  const newImageKeys = uploadedImages.map((img) => img.imageKey);

  const allImageUrls = useMemo(
    () => [...existingImageUrls, ...newImageUrls],
    [existingImageUrls, newImageUrls],
  );
  const allImageKeys = useMemo(
    () => [...existingImageKeys, ...newImageKeys],
    [existingImageKeys, newImageKeys],
  );

  const isMaxImages = allImageKeys.length >= RETRO_IMAGE_MAX_COUNT;
  const isUploadDisabled = isImageUploading || updateMutation.isPending || isMaxImages;

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

    if (isContentOverflow) setIsContentOverflow(false);
    setValue("content", nextValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleImageChangeWithLimit = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    if (allImageKeys.length + files.length > RETRO_IMAGE_MAX_COUNT) {
      showToast(RETRO_IMAGE_MAX_TOAST_MESSAGE, "error");
      return;
    }
    void handleImageChange(event);
  };

  const handleClose = () => {
    reset();
    clearUploadedImages();
    setIsContentOverflow(false);
    onOpenChange(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!retro) return;
    await updateMutation.mutateAsync({
      reflectionId: retro.id,
      content: values.content,
      isOpen: values.isOpen,
      reflectionImageKeys: allImageKeys,
    });
  });

  const contentHelperText = isContentOverflow
    ? RETRO_CONTENT_MAX_HELPER_TEXT
    : (errors.content?.message ?? undefined);

  const canSubmit = isValid && !isSubmitting && !updateMutation.isPending && !isImageUploading;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      closeOnOverlayClick
      peekHeight={55}
      expandHeight={85}
      enableDragHandle
      sheetClassName="overflow-hidden pb-[env(safe-area-inset-bottom)]"
    >
      <section className="flex h-full min-h-0 flex-col px-6 pt-3 pb-4">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">회고 수정</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-sm font-medium text-neutral-500"
          >
            닫기
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="scrollbar-hide mb-4 flex w-full gap-3 overflow-x-auto pb-1">
            {allImageUrls.length > 0 ? (
              <HorizontalImageAlbum
                imageUrls={allImageUrls}
                tileSize={140}
                imageAltPrefix="회고 이미지"
                scrollAreaLabel="회고 이미지 가로 스크롤"
                enableKeyboardScroll={false}
                className="shrink-0 overflow-visible"
              />
            ) : null}

            {!isMaxImages ? (
              <label className="relative h-[160px] w-[160px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#d9d9d9]">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadDisabled}
                  className="sr-only"
                  onChange={handleImageChangeWithLimit}
                />
                <span className="absolute inset-0 flex items-center justify-center font-semibold text-black">
                  {isImageUploading ? "업로드 중..." : "사진 추가"}
                </span>
              </label>
            ) : null}
          </div>

          <RetroContentField
            placeholder="(선택) 내용을 입력하세요."
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
                setValue("isOpen", next, { shouldValidate: true, shouldDirty: true })
              }
            />
          </div>
        </div>

        <PrimaryButton
          type="button"
          onClick={() => void onSubmit()}
          disabled={!canSubmit}
          className="mt-4"
        >
          {updateMutation.isPending ? "수정 중..." : "수정 완료"}
        </PrimaryButton>
      </section>
    </BottomSheet>
  );
}
