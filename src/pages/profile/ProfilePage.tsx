"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { useEffect, useRef } from "react";

import { FormField, ProfileImageKeyInput } from "@/shared/form/ui";
import { useStackPage } from "@/widgets/stack";
import { useMyProfileQuery, useUpdateMyProfileImageMutation } from "@/entities/user";
import { useProfileImagePresign } from "@/features/image/model";

import { MyInfoStackPage } from "./MyInfoStackPage";

export function ProfilePage() {
  const { push } = useStackPage();
  const { data: myProfile } = useMyProfileQuery();
  const { handleFileSelect, previewUrl, imageKey, isUploading } = useProfileImagePresign();
  const updateImageMutation = useUpdateMyProfileImageMutation();
  const lastImageKeyRef = useRef<string | null>(null);

  const profileImageKeyRegister: UseFormRegisterReturn = {
    name: "profileImageKey",
    onChange: async () => undefined,
    onBlur: async () => undefined,
    ref: () => undefined,
  };

  const errors = { profileImageKey: undefined as string | undefined };
  const username = myProfile?.nickname ?? "";

  useEffect(() => {
    if (!imageKey || imageKey === lastImageKeyRef.current) return;
    lastImageKeyRef.current = imageKey;
    updateImageMutation.mutate({
      imageKey,
      profileImageUrl: previewUrl ?? null,
    });
  }, [imageKey, previewUrl, updateImageMutation]);

  const handleOpenMyInfo = () => {
    push(<MyInfoStackPage />);
  };

  const resolvedPreviewUrl = previewUrl ?? myProfile?.profileImageUrl ?? null;

  return (
    <div className="px-6 py-10">
      <FormField
        label=""
        error={errors.profileImageKey}
        className="items-center"
        contentClassName="flex flex-col items-center justify-center"
      >
        <ProfileImageKeyInput
          register={profileImageKeyRegister}
          invalid={Boolean(errors.profileImageKey)}
          previewUrl={resolvedPreviewUrl}
          onFileSelect={handleFileSelect}
          isDisabled={isUploading || updateImageMutation.isPending}
        />
        <div className="mt-4 text-center text-lg font-semibold text-neutral-900">{username}</div>
      </FormField>
      <div className="mt-10 grid grid-cols-3 gap-4">
        <button
          type="button"
          className="text-neutral-900m flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-neutral-100 text-lg font-semibold"
          onClick={handleOpenMyInfo}
        >
          내 정보
        </button>
      </div>
    </div>
  );
}
