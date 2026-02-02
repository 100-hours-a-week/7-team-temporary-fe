"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { FormField, ProfileImageKeyInput } from "@/shared/form/ui";
import { useStackPage } from "@/widgets/stack";
import { useMyProfileQuery, useUpdateMyProfileImageMutation } from "@/entities/user";
import { useProfileImagePresign } from "@/features/image/model";
import { ActionButton } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";
import { AuthService } from "@/shared/auth";

import { MyInfoStackPage } from "./MyInfoStackPage";

export function ProfilePage() {
  const { push } = useStackPage();
  const router = useRouter();
  const { data: myProfile, isLoading: isProfileLoading } = useMyProfileQuery();
  const { handleFileSelect, previewUrl, imageKey, isUploading, loadImageViewUrl } =
    useProfileImagePresign();
  const updateImageMutation = useUpdateMyProfileImageMutation();
  const { showToast } = useToast();
  const lastImageKeyRef = useRef<string | null>(null);
  const lastViewKeyRef = useRef<string | null>(null);
  const DEFAULT_PROFILE_IMAGE_NAME = "default_image.png";
  const isDefaultProfileKey = (key?: string | null) =>
    typeof key === "string" && key.includes(DEFAULT_PROFILE_IMAGE_NAME);

  const profileImageKeyRegister: UseFormRegisterReturn = {
    name: "profileImageKey",
    onChange: async () => undefined,
    onBlur: async () => undefined,
    ref: () => undefined,
  };

  const errors = { profileImageKey: undefined as string | undefined };
  const username = myProfile?.nickname ?? "";
  const handleProfileImageError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "프로필 이미지 업로드에 실패했습니다.";
      showToast(message, "error");
    },
    [showToast],
  );

  useEffect(() => {
    if (!imageKey || imageKey === lastImageKeyRef.current) return;
    lastImageKeyRef.current = imageKey;
    updateImageMutation.mutate({
      imageKey,
      profileImageUrl: previewUrl ?? null,
    });
  }, [imageKey, previewUrl, updateImageMutation]);

  useEffect(() => {
    const profileImageKey = myProfile?.profileImageKey;
    if (!profileImageKey) return;
    if (isDefaultProfileKey(profileImageKey)) return;
    if (imageKey) return;
    if (lastViewKeyRef.current === profileImageKey) return;
    lastViewKeyRef.current = profileImageKey;
    loadImageViewUrl(profileImageKey, "USERS").catch(handleProfileImageError);
  }, [imageKey, loadImageViewUrl, myProfile?.profileImageKey, handleProfileImageError]);

  const handleOpenMyInfo = () => {
    push(<MyInfoStackPage />);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    // router.replace("/login");
  };

  const resolvedPreviewUrl = previewUrl ?? myProfile?.profileImageUrl ?? null;
  const resolvedImageKey = imageKey ?? myProfile?.profileImageKey ?? null;
  const shouldShowImageSkeleton = isProfileLoading && !resolvedPreviewUrl;

  return (
    <div className="px-6 py-10">
      <FormField
        label=""
        error={errors.profileImageKey}
        className="items-center"
        contentClassName="flex flex-col items-center justify-center"
      >
        <div className="relative h-28 w-28">
          <ProfileImageKeyInput
            register={profileImageKeyRegister}
            invalid={Boolean(errors.profileImageKey)}
            previewUrl={resolvedPreviewUrl}
            imageKey={resolvedImageKey}
            onFileSelect={handleFileSelect}
            onUploadError={handleProfileImageError}
            isDisabled={isUploading || updateImageMutation.isPending || isProfileLoading}
          />
          {shouldShowImageSkeleton ? (
            <div
              className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-neutral-200"
              aria-hidden
            />
          ) : null}
        </div>
        <div className="mt-4 text-center text-lg font-semibold text-neutral-900">{username}</div>
      </FormField>
      <div className="mt-10 grid grid-cols-3 gap-4">
        <button
          type="button"
          className="text-neutral-900m flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-neutral-200 text-lg font-semibold"
          onClick={handleOpenMyInfo}
        >
          내 정보
        </button>
      </div>
      <div className="mt-12 flex items-center justify-center">
        <ActionButton
          buttonText="로그아웃"
          onClick={handleLogout}
          className="border-[color:var(--color-ink-300)] text-[color:var(--color-ink-300)]"
        />
      </div>
    </div>
  );
}
