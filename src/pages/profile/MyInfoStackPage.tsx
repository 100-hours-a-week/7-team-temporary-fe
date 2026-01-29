"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useStackPage } from "@/widgets/stack";
import {
  useMyProfileQuery,
  useDeleteMyProfileMutation,
  useUpdateMyProfileMutation,
  type UpdateMyProfileModel,
} from "@/entities/user";

import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { BASE_INPUT_CLASS_NAME, FormField } from "@/shared/form/ui";
import { useToast } from "@/shared/ui/toast";
import { PasswordChangeSheet } from "@/features/profile/password-change";
import { AuthService } from "@/shared/auth";
import { BottomSheet, ConfirmDialog, Icon } from "@/shared/ui";
import { useMutationErrorEffect } from "@/shared/query";
import { apiFetch, Endpoint } from "@/shared/api";

const focusTimeOptions = [
  { value: "MORNING", label: "오전" },
  { value: "AFTERNOON", label: "오후" },
  { value: "EVENING", label: "저녁" },
  { value: "NIGHT", label: "밤" },
] as const;

const TERMS_LINKS = new Map<number, string>([
  [2, "https://wide-legend-7e1.notion.site/2f4ee90a967f8141bb7dc3cc8968fa79?source=copy_link"],
  [1, "https://wide-legend-7e1.notion.site/2f4ee90a967f8155a0ebc4c9616ba4e7?pvs=73"],
  [3, "https://wide-legend-7e1.notion.site/2f4ee90a967f81f080eec2327efef776?source=copy_link"],
]);

type TermsSignItem = {
  termsSignId: number;
  termsId: number;
  name: string;
  termsType: "MANDATORY" | "OPTIONAL";
  isAgreed: boolean;
  agreedAt: string;
};

export function MyInfoStackPage() {
  const { setHeaderContent } = useStackPage();
  const { data: myProfile } = useMyProfileQuery();
  const { showToast } = useToast();
  const updateMutation = useUpdateMyProfileMutation();
  const deleteMutation = useDeleteMyProfileMutation();
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTermsSheetOpen, setIsTermsSheetOpen] = useState(false);
  const [pendingTermsId, setPendingTermsId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<UpdateMyProfileModel>({
    defaultValues: {
      gender: "MALE",
      birth: "",
      focusTimeZone: "MORNING",
      dayEndTime: "",
      nickname: "",
    },
  });

  const inputClassName = BASE_INPUT_CLASS_NAME;
  const selectClassName = `${BASE_INPUT_CLASS_NAME} appearance-none`;

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">내 정보</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  useEffect(() => {
    if (!myProfile) return;
    form.reset({
      gender: myProfile.gender,
      birth: myProfile.birth,
      focusTimeZone: myProfile.focusTimeZone,
      dayEndTime: myProfile.dayEndTime,
      nickname: myProfile.nickname,
    });
  }, [form, myProfile]);

  const isSaving = updateMutation.isPending || form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const termsSignQuery = useQuery({
    queryKey: ["terms-sign"],
    queryFn: ({ signal }) =>
      AuthService.refreshAndRetry(() =>
        apiFetch<TermsSignItem[]>(Endpoint.TERMS_SIGN.LIST, {
          signal,
          authRequired: true,
        }),
      ),
    enabled: isTermsSheetOpen,
  });

  const updateTermsSignMutation = useMutation({
    mutationFn: ({ termsId, isAgreed }: { termsId: number; isAgreed: boolean }) =>
      AuthService.refreshAndRetry(() =>
        apiFetch<void, { isAgreed: boolean }>(Endpoint.TERMS_SIGN.UPDATE(termsId), {
          method: "PATCH",
          body: { isAgreed },
          authRequired: true,
        }),
      ),
    onMutate: async ({ termsId, isAgreed }) => {
      setPendingTermsId(termsId);
      await queryClient.cancelQueries({ queryKey: ["terms-sign"] });
      const previous = queryClient.getQueryData<TermsSignItem[]>(["terms-sign"]);
      queryClient.setQueryData<TermsSignItem[]>(["terms-sign"], (prev) => {
        if (!prev) return prev;
        return prev.map((item) => (item.termsId === termsId ? { ...item, isAgreed } : item));
      });
      return { previous };
    },
    onSuccess: () => {
      showToast("약관 동의가 변경되었습니다.", "success");
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["terms-sign"], context.previous);
      }
    },
    onSettled: () => {
      setPendingTermsId(null);
    },
  });

  useMutationErrorEffect(updateTermsSignMutation);

  const termsItems = useMemo(() => termsSignQuery.data ?? [], [termsSignQuery.data]);

  const handleSave = form.handleSubmit((values) =>
    updateMutation.mutate(values, {
      onSuccess: () => {
        showToast("저장되었습니다.", "success");
      },
    }),
  );

  const handleDeleteAccount = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: async () => {
        showToast("탈퇴가 완료되었습니다.", "success");
        await AuthService.logout();
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        showToast("탈퇴에 실패했습니다.", "error");
      },
    });
  };

  const handleToggleTerms = (termsId: number, nextAgreed: boolean) => {
    updateTermsSignMutation.mutate({ termsId, isAgreed: nextAgreed });
  };

  const formatAgreedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <form
        onSubmit={handleSave}
        className="flex h-fit w-full flex-col items-center justify-center px-10 py-[30px]"
      >
        <div className="flex w-full flex-1 items-start justify-center">
          <div className="w-full rounded-3xl p-0">
            <div className="m-0 flex flex-col gap-[25px]">
              <FormField
                label="이메일"
                labelAdornment={
                  <span className="text-sm font-semibold text-red-500">변경불가</span>
                }
                className="w-full flex-col items-start gap-3"
                labelClassName="flex items-center gap-2 text-base font-semibold text-neutral-900"
              >
                <input
                  type="email"
                  value={myProfile?.email ?? ""}
                  readOnly
                  className={inputClassName}
                  disabled
                />
              </FormField>
              <div className="flex items-end gap-6">
                <FormField
                  label="성별"
                  className="flex-1"
                  labelClassName="text-lg font-semibold text-neutral-900"
                >
                  <select
                    {...form.register("gender")}
                    className={selectClassName}
                  >
                    <option value="MALE">남</option>
                    <option value="FEMALE">여</option>
                  </select>
                </FormField>
                <FormField
                  label="생년월일"
                  className="w-full max-w-[187px]"
                  labelClassName="text-base font-semibold text-neutral-900"
                >
                  <input
                    type="text"
                    placeholder="YYYY.MM.DD"
                    className={inputClassName}
                    {...form.register("birth")}
                  />
                </FormField>
              </div>
              <div className="flex items-end justify-end gap-4">
                <FormField
                  label="닉네임"
                  className="flex-1 flex-col items-start gap-3"
                  labelClassName="text-base font-semibold text-neutral-900"
                >
                  <input
                    type="text"
                    className={inputClassName}
                    {...form.register("nickname")}
                  />
                </FormField>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-neutral-900">비밀번호 변경</div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-neutral-900 px-5 py-2 text-base font-semibold text-neutral-900"
                  onClick={() => setIsPasswordSheetOpen(true)}
                >
                  변경하기
                </button>
              </div>
              <div className="h-px w-full bg-neutral-200" />
              <FormField
                label="하루 집중 시간대"
                className="flex-col items-start gap-3"
                labelClassName="text-lg font-semibold text-neutral-900"
              >
                <select
                  {...form.register("focusTimeZone")}
                  className={selectClassName}
                >
                  {focusTimeOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                label="하루 마무리 시간"
                className="flex-col items-start gap-3"
                labelClassName="text-lg font-semibold text-neutral-900"
              >
                <input
                  type="time"
                  className={inputClassName}
                  {...form.register("dayEndTime")}
                />
              </FormField>
            </div>
          </div>
        </div>
        <div className="mt-6 w-full">
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="정말 탈퇴하시겠습니까?"
            description="탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다."
            confirmText={deleteMutation.isPending ? "탈퇴 중..." : "확인"}
            cancelText="취소"
            confirmDisabled={deleteMutation.isPending}
            cancelDisabled={deleteMutation.isPending}
            onConfirm={handleDeleteAccount}
            contentClassName="bg-white rounded-3xl"
            trigger={
              <button
                type="button"
                className="w-full rounded-full border border-red-500 px-4 py-3 text-sm font-semibold text-red-500"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "탈퇴 중..." : "탈퇴하기"}
              </button>
            }
          />
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900"
            onClick={() => setIsTermsSheetOpen(true)}
          >
            약관 변경하기
          </button>
        </div>
        <div className="h-[70px]" />
        <FixedActionBar>
          <PrimaryButton
            type="submit"
            className="w-full"
            disabled={isSaving || !isDirty}
          >
            {isSaving ? "저장 중..." : "저장"}
          </PrimaryButton>
        </FixedActionBar>
      </form>

      <PasswordChangeSheet
        open={isPasswordSheetOpen}
        onOpenChange={setIsPasswordSheetOpen}
      />

      <BottomSheet
        open={isTermsSheetOpen}
        onOpenChange={setIsTermsSheetOpen}
        peekHeight={70}
        expandHeight={70}
        enableDragHandle
        className="pb-[env(safe-area-inset-bottom)]"
      >
        <div className="px-6 pb-6">
          <div className="pt-2 text-lg font-semibold text-neutral-900">약관 변경하기</div>
          <div className="mt-4 flex flex-col gap-3">
            {termsSignQuery.isLoading ? (
              <div className="text-sm text-neutral-400">약관 정보를 불러오는 중...</div>
            ) : null}
            {termsSignQuery.isError ? (
              <div className="text-sm text-neutral-400">약관 정보를 불러오지 못했습니다.</div>
            ) : null}
            {termsItems.map((term) => {
              const href = TERMS_LINKS.get(term.termsId);
              const isPending =
                pendingTermsId === term.termsId || updateTermsSignMutation.isPending;
              const isMandatory = term.termsType === "MANDATORY";
              const canToggle = !isMandatory && !isPending;
              return (
                <div
                  key={term.termsSignId}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-0 py-[9px]"
                >
                  <div className="flex flex-1 flex-col">
                    <span className="flex items-center gap-2 text-sm text-neutral-900">
                      <input
                        type="checkbox"
                        checked={term.isAgreed}
                        disabled={!canToggle}
                        onChange={() => {
                          if (!canToggle) return;
                          handleToggleTerms(term.termsId, !term.isAgreed);
                        }}
                        className="h-4 w-4 accent-neutral-900"
                      />
                      {term.name}
                    </span>
                    <span className="pt-1 pl-6 text-xs text-neutral-400">
                      동의일: {formatAgreedAt(term.agreedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {href ? (
                      <Link
                        href={href}
                        aria-label={`${term.name} 상세 보기`}
                        title={`${term.name} 상세 보기`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus:ring-error/30 inline-flex items-center justify-center rounded-md text-neutral-400 focus:outline-none"
                      >
                        <Icon
                          name="next"
                          className="h-[18px] w-4"
                          aria-hidden="true"
                          focusable="false"
                        />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className={
                        term.isAgreed
                          ? "rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white"
                          : "rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-500"
                      }
                      disabled={!canToggle}
                      onClick={() => handleToggleTerms(term.termsId, !term.isAgreed)}
                    >
                      {isPending ? "변경 중..." : term.isAgreed ? "동의함" : "미동의"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
