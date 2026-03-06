"use client";

import { useCallback } from "react";
import { ApiError, COMMON_ERROR_CODE, CommonError } from "@/shared/api";

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
import {
  CHAT_ROOM_INPUT_TONE_CLASS_NAME,
  CREATE_CHAT_ROOM_FAILURE_MESSAGE,
  CREATE_CHAT_ROOM_NETWORK_ERROR_MESSAGE,
  CREATE_CHAT_ROOM_SERVER_ERROR_MESSAGE,
} from "./constants";

interface CreateChatRoomFormProps {
  onCreated?: (roomId: number) => void;
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
        const createdRoom = await createChatRoomMutation.mutateAsync(values);
        if (typeof createdRoom?.roomId !== "number") {
          throw new Error("생성된 채팅방 식별자가 없습니다.");
        }
        onCreated?.(createdRoom.roomId);
      } catch (error) {
        showToast(getCreateChatRoomErrorMessage(error), "error");
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
