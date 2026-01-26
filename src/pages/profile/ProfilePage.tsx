"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

import { FormField, ProfileImageKeyInput } from "@/shared/form/ui";
import { useStackPage } from "@/widgets/stack";
import { useMyProfileQuery } from "@/entities/user";

import { MyInfoStackPage } from "./MyInfoStackPage";

export function ProfilePage() {
  const { push } = useStackPage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previousPreviewUrlRef = useRef<string | null>(null);
  const { data: myProfile } = useMyProfileQuery();

  const profileImageKeyRegister: UseFormRegisterReturn = {
    name: "profileImageKey",
    onChange: async () => undefined,
    onBlur: async () => undefined,
    ref: () => undefined,
  };

  const errors = { profileImageKey: undefined as string | undefined };
  const username = myProfile?.nickname ?? "";

  useEffect(() => {
    if (!previewUrl && myProfile?.profileImageUrl) {
      setPreviewUrl(myProfile.profileImageUrl);
    }
  }, [myProfile?.profileImageUrl, previewUrl]);

  const handleFileSelect = (file: File | null) => {
    if (previousPreviewUrlRef.current) {
      URL.revokeObjectURL(previousPreviewUrlRef.current);
      previousPreviewUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previousPreviewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  };

  const handleOpenMyInfo = () => {
    push(<MyInfoStackPage />);
  };

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
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
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
