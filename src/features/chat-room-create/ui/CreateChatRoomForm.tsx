"use client";

import { useCallback, useEffect } from "react";
import { ApiError, COMMON_ERROR_CODE, CommonError } from "@/shared/api";
import { cn } from "@/shared/lib";

import { BaseInput, FormField } from "@/shared/form/ui";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

import {
  type CreateChatRoomResponseDto,
  type CreateChatRoomFormModel,
  CREATE_CHAT_ROOM_TYPE_OPTIONS,
} from "../model/types";
import {
  createChatRoomTypeRules,
  createChatRoomDescriptionRules,
  createChatRoomGroupNameRules,
  createChatRoomMaxParticipantsRules,
} from "../model/validation";
import { useCreateChatRoomMutation } from "../model/useCreateChatRoomMutation";
import { useCreateChatRoomForm } from "../model/useCreateChatRoomForm";
import {
  CHAT_ROOM_INPUT_TONE_CLASS_NAME,
  CREATE_CHAT_ROOM_FAILURE_MESSAGE,
  CREATE_CHAT_ROOM_NETWORK_ERROR_MESSAGE,
  CREATE_CHAT_ROOM_SERVER_ERROR_MESSAGE,
} from "./constants";

interface CreateChatRoomFormProps {
  onCreated?: (createdRoom: CreateChatRoomResponseDto) => void;
}

function getCreateChatRoomErrorMessage(error: unknown) {
  if (error instanceof CommonError) {
    if (error.code === COMMON_ERROR_CODE.NETWORK_ERROR) {
      return CREATE_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
    }
    if (error.code === COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR) {
      return CREATE_CHAT_ROOM_SERVER_ERROR_MESSAGE;
    }
    return error.userMessage;
  }

  if (error instanceof ApiError && error.httpStatus >= 500) {
    return CREATE_CHAT_ROOM_SERVER_ERROR_MESSAGE;
  }

  if (error instanceof TypeError) {
    return CREATE_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
  }

  return CREATE_CHAT_ROOM_FAILURE_MESSAGE;
}

export function CreateChatRoomForm({ onCreated }: CreateChatRoomFormProps) {
  const { showToast } = useToast();
  const createChatRoomMutation = useCreateChatRoomMutation();
  const handleCreateChatRoom = useCallback(
    async (values: CreateChatRoomFormModel) => {
      try {
        const normalizedValues =
          values.type === "CAM_STUDY" ? { ...values, maxParticipants: "10" } : values;
        const createdRoom = await createChatRoomMutation.mutateAsync(normalizedValues);
        if (typeof createdRoom?.roomId !== "number") {
          throw new Error("생성된 채팅방 식별자가 없습니다.");
        }
        if (typeof createdRoom?.participantId !== "number") {
          throw new Error("생성된 참가자 식별자가 없습니다.");
        }
        onCreated?.(createdRoom);
      } catch (error) {
        showToast(getCreateChatRoomErrorMessage(error), "error");
      }
    },
    [createChatRoomMutation, onCreated, showToast],
  );
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    canSubmit,
    submitForm,
  } = useCreateChatRoomForm({ onValid: handleCreateChatRoom });
  const selectedType = watch("type");
  const maxParticipants = watch("maxParticipants");
  const isCamStudyType = selectedType === "CAM_STUDY";

  useEffect(() => {
    if (!isCamStudyType) return;
    if (maxParticipants === "10") return;
    setValue("maxParticipants", "10", { shouldDirty: true, shouldValidate: true });
  }, [isCamStudyType, maxParticipants, setValue]);

  return (
    <>
      <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-32">
        <form
          id="create-chat-room-form"
          className="flex flex-col gap-4"
          onSubmit={submitForm}
        >
          <FormField
            label="방 유형"
            error={errors.type?.message}
          >
            <input
              type="hidden"
              {...register("type", createChatRoomTypeRules)}
            />
            <div className="grid grid-cols-2 gap-2">
              {CREATE_CHAT_ROOM_TYPE_OPTIONS.map((option) => {
                const isSelected = selectedType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    className={cn(
                      "flex min-h-[84px] flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 bg-white",
                    )}
                    onClick={() =>
                      setValue("type", option.type, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isSelected ? "text-primary-700" : "text-neutral-800",
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="mt-1 text-xs text-neutral-500">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField
            label="그룹명"
            error={errors.title?.message}
          >
            <BaseInput
              register={register("title", createChatRoomGroupNameRules)}
              invalid={!!errors.title}
              placeholder="그룹명을 입력해주세요."
              type="text"
              className={CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>

          <FormField
            label="그룹 채팅방 설명"
            labelDescription="채팅방 검색 시 채팅방에 대한 설명으로 표시됩니다."
            error={errors.description?.message}
          >
            <BaseInput
              register={register("description", createChatRoomDescriptionRules)}
              invalid={!!errors.description}
              placeholder="그룹 채팅방 설명을 입력해주세요."
              type="text"
              className={CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>

          <FormField
            label="그룹 인원"
            helperText={isCamStudyType ? "캠 스터디방은 최대 10명으로 고정됩니다." : undefined}
            error={errors.maxParticipants?.message}
          >
            <BaseInput
              register={register("maxParticipants", createChatRoomMaxParticipantsRules)}
              invalid={!!errors.maxParticipants}
              placeholder="모집 인원을 입력해주세요."
              type="text"
              inputMode="numeric"
              disabled={isCamStudyType}
              className={CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>
        </form>
      </section>

      <FixedActionBar>
        <PrimaryButton
          type="submit"
          form="create-chat-room-form"
          disabled={!canSubmit || createChatRoomMutation.isPending}
        >
          {createChatRoomMutation.isPending ? "생성 중..." : "방 생성하기"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
