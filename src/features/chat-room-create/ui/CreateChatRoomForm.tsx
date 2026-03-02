"use client";

import { useCallback } from "react";

import { BaseInput, FormField } from "@/shared/form/ui";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

import {
  createChatRoomDescriptionRules,
  createChatRoomGroupNameRules,
  createChatRoomMaxParticipantsRules,
} from "../model/validation";
import type { CreateChatRoomFormModel } from "../model/types";
import { useCreateChatRoomMutation } from "../model/useCreateChatRoomMutation";
import { useCreateChatRoomForm } from "../model/useCreateChatRoomForm";

const CHAT_ROOM_INPUT_TONE_CLASS_NAME = "bg-white text-neutral-700 placeholder:text-neutral-400";
const CREATE_CHAT_ROOM_FAILURE_MESSAGE = "그룹 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";

interface CreateChatRoomFormProps {
  onCreated?: () => void;
}

export function CreateChatRoomForm({ onCreated }: CreateChatRoomFormProps) {
  const { showToast } = useToast();
  const createChatRoomMutation = useCreateChatRoomMutation();
  const handleCreateChatRoom = useCallback(
    async (values: CreateChatRoomFormModel) => {
      try {
        await createChatRoomMutation.mutateAsync(values);
        onCreated?.();
      } catch {
        showToast(CREATE_CHAT_ROOM_FAILURE_MESSAGE, "error");
      }
    },
    [createChatRoomMutation, onCreated, showToast],
  );
  const {
    register,
    formState: { errors },
    canSubmit,
    submitForm,
  } = useCreateChatRoomForm({ onValid: handleCreateChatRoom });

  return (
    <>
      <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-32">
        <form
          id="create-chat-room-form"
          className="flex flex-col gap-4"
          onSubmit={submitForm}
        >
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
            error={errors.maxParticipants?.message}
          >
            <BaseInput
              register={register("maxParticipants", createChatRoomMaxParticipantsRules)}
              invalid={!!errors.maxParticipants}
              placeholder="모집 인원을 입력해주세요."
              type="text"
              inputMode="numeric"
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
          {createChatRoomMutation.isPending ? "생성 중..." : "그룹 생성하기"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
