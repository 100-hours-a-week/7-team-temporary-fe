"use client";

import { useEffect } from "react";

import { BottomSheet } from "@/shared/ui";
import { BASE_INPUT_CLASS_NAME, FormField } from "@/shared/form/ui";
import { PrimaryButton } from "@/shared/ui/button";
import { useUpdatePasswordMutation } from "@/entities/user";

import { usePasswordChangeForm } from "../model/usePasswordChangeForm";
import type { PasswordChangeFormModel } from "../model/types";

type PasswordChangeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: PasswordChangeFormModel) => void;
  closeOnSubmit?: boolean;
};

export function PasswordChangeSheet({
  open,
  onOpenChange,
  onSubmit,
  closeOnSubmit = true,
}: PasswordChangeSheetProps) {
  const mutation = useUpdatePasswordMutation();
  const form = usePasswordChangeForm({
    onValid: (values) => {
      mutation.mutate(values, {
        onSuccess: () => {
          onSubmit?.(values);
          if (closeOnSubmit) {
            onOpenChange(false);
          }
        },
      });
    },
  });

  const {
    register,
    reset,
    formState: { errors },
    canSubmit,
    submitForm,
  } = form;

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="비밀번호 변경 모달 닫기"
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => onOpenChange(false)}
        />
      )}
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        peekHeight={326}
        expandHeight={326}
        heightUnit="px"
        className="pb-[env(safe-area-inset-bottom)]"
        enableDragHandle
      >
        <form
          onSubmit={submitForm}
          className="px-6 pb-8"
        >
          <div className="text-xl font-semibold text-neutral-900">비밀번호 변경</div>
          <div className="mt-6 flex flex-col gap-4">
            <FormField
              label="새 비밀번호"
              error={errors.password?.message?.toString()}
            >
              <input
                type="password"
                placeholder="새 비밀번호"
                className={BASE_INPUT_CLASS_NAME}
                {...register("password")}
              />
            </FormField>
            <FormField
              label="비밀번호 확인"
              error={errors.passwordConfirm?.message?.toString()}
            >
              <input
                type="password"
                placeholder="비밀번호 확인"
                className={BASE_INPUT_CLASS_NAME}
                {...register("passwordConfirm")}
              />
            </FormField>
          </div>
          <PrimaryButton
            type="submit"
            className="mt-8 w-full"
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "저장 중..." : "비밀번호 저장"}
          </PrimaryButton>
        </form>
      </BottomSheet>
    </>
  );
}
