"use client";

import { useCallback, useEffect, useState } from "react";
import { useChatRoomDetailQuery, useChatRoomOwnerStatusQuery } from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { ApiError, COMMON_ERROR_CODE, CommonError } from "@/shared/api";

import { BaseInput, FormField } from "@/shared/form/ui";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui";
import { useToast } from "@/shared/ui/toast";

import {
  editChatRoomDescriptionRules,
  editChatRoomGroupNameRules,
  editChatRoomMaxParticipantsRules,
  type EditChatRoomFormModel,
  useDeleteChatRoomMutation,
  useEditChatRoomForm,
  useEditChatRoomMutation,
} from "../model";
import {
  DELETE_CHAT_ROOM_FAILURE_MESSAGE,
  DELETE_CHAT_ROOM_SUCCESS_MESSAGE,
  EDIT_CHAT_ROOM_FAILURE_MESSAGE,
  EDIT_CHAT_ROOM_INPUT_TONE_CLASS_NAME,
  EDIT_CHAT_ROOM_NETWORK_ERROR_MESSAGE,
  EDIT_CHAT_ROOM_SERVER_ERROR_MESSAGE,
} from "./constants";

interface EditChatRoomFormProps {
  roomId: number;
  onDeleted?: () => void;
}

function getRequestErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof CommonError) {
    if (error.code === COMMON_ERROR_CODE.NETWORK_ERROR) {
      return EDIT_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
    }
    if (error.code === COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR) {
      return EDIT_CHAT_ROOM_SERVER_ERROR_MESSAGE;
    }
    return error.userMessage;
  }

  if (error instanceof ApiError && error.httpStatus >= 500) {
    return EDIT_CHAT_ROOM_SERVER_ERROR_MESSAGE;
  }

  if (error instanceof TypeError) {
    return EDIT_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
  }

  return fallbackMessage;
}

export function EditChatRoomForm({ roomId, onDeleted }: EditChatRoomFormProps) {
  const { showToast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const myUserId = useAuthStore((state) => state.userId ?? null);
  const chatRoomDetailQuery = useChatRoomDetailQuery({ roomId });
  const ownerStatusQuery = useChatRoomOwnerStatusQuery({
    roomId,
    ownerId: myUserId,
    enabled: chatRoomDetailQuery.isSuccess,
  });
  const editChatRoomMutation = useEditChatRoomMutation(roomId);
  const deleteChatRoomMutation = useDeleteChatRoomMutation(roomId);

  const handleEditChatRoom = useCallback(
    async (values: EditChatRoomFormModel) => {
      try {
        await editChatRoomMutation.mutateAsync(values);
        showToast("그룹 정보가 수정되었습니다.", "success");
      } catch (error) {
        showToast(getRequestErrorMessage(error, EDIT_CHAT_ROOM_FAILURE_MESSAGE), "error");
      }
    },
    [editChatRoomMutation, showToast],
  );

  const {
    register,
    reset,
    formState: { errors, isDirty },
    canSubmit,
    submitForm,
  } = useEditChatRoomForm({ onValid: handleEditChatRoom });

  useEffect(() => {
    if (!chatRoomDetailQuery.data) return;
    if (isDirty) return;

    reset({
      title: chatRoomDetailQuery.data.title,
      description: chatRoomDetailQuery.data.description,
      maxParticipants: String(chatRoomDetailQuery.data.maxParticipants),
    });
  }, [chatRoomDetailQuery.data, isDirty, reset]);

  const handleDeleteChatRoom = useCallback(async () => {
    try {
      await deleteChatRoomMutation.mutateAsync(undefined);
      showToast(DELETE_CHAT_ROOM_SUCCESS_MESSAGE, "success");
      onDeleted?.();
    } catch (error) {
      showToast(getRequestErrorMessage(error, DELETE_CHAT_ROOM_FAILURE_MESSAGE), "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [deleteChatRoomMutation, onDeleted, showToast]);

  const isDeletePending = deleteChatRoomMutation.isPending;
  const isEditPending = editChatRoomMutation.isPending;
  const isDetailReady = chatRoomDetailQuery.isSuccess;
  const roomTitle = chatRoomDetailQuery.data?.title?.trim() || "현재";
  const canManageRoom = ownerStatusQuery.data?.isOwner === true;
  const isOwnerStatusLoading =
    isDetailReady && (ownerStatusQuery.isLoading || ownerStatusQuery.isFetching);
  const isOwnerStatusError = isDetailReady && ownerStatusQuery.isError;
  const isNotOwner =
    isDetailReady && !isOwnerStatusLoading && !isOwnerStatusError && !canManageRoom;
  const isPermissionBlocked =
    !isDetailReady || isNotOwner || isOwnerStatusLoading || isOwnerStatusError;
  const isDisabled = isDeletePending || isEditPending || isPermissionBlocked;

  useEffect(() => {
    if (!isOwnerStatusError) return;
    showToast("수정 권한을 확인하지 못했습니다.", "error");
  }, [isOwnerStatusError, showToast]);

  return (
    <>
      <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-32">
        {chatRoomDetailQuery.isLoading ? (
          <div className="mb-4 rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
            채팅방 정보를 불러오는 중...
          </div>
        ) : null}

        {chatRoomDetailQuery.isError ? (
          <div className="mb-4 rounded-2xl bg-[#FFF2F2] px-4 py-3 text-sm text-[#DF454A]">
            채팅방 정보를 불러오지 못했습니다.
          </div>
        ) : null}

        <form
          id="edit-chat-room-form"
          className="flex flex-col gap-4"
          onSubmit={submitForm}
        >
          <FormField
            label="그룹명"
            error={errors.title?.message}
          >
            <BaseInput
              register={register("title", editChatRoomGroupNameRules)}
              invalid={!!errors.title}
              placeholder="그룹명을 입력해주세요."
              type="text"
              disabled={isDisabled}
              className={EDIT_CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>

          <FormField
            label="그룹 채팅방 설명"
            labelDescription="채팅방 검색 시 채팅방에 대한 설명으로 표시됩니다."
            error={errors.description?.message}
          >
            <BaseInput
              register={register("description", editChatRoomDescriptionRules)}
              invalid={!!errors.description}
              placeholder="그룹 채팅방 설명을 입력해주세요."
              type="text"
              disabled={isDisabled}
              className={EDIT_CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>

          <FormField
            label="그룹 인원"
            error={errors.maxParticipants?.message}
          >
            <BaseInput
              register={register("maxParticipants", editChatRoomMaxParticipantsRules)}
              invalid={!!errors.maxParticipants}
              placeholder="모집 인원을 입력해주세요."
              type="text"
              inputMode="numeric"
              disabled={isDisabled}
              className={EDIT_CHAT_ROOM_INPUT_TONE_CLASS_NAME}
            />
          </FormField>

          {canManageRoom ? (
            <ConfirmDialog
              open={isDeleteConfirmOpen}
              onOpenChange={setIsDeleteConfirmOpen}
              title={`${roomTitle} 채팅방을 정말 삭제하시겠습니까?`}
              confirmText={isDeletePending ? "삭제 중..." : "삭제"}
              cancelText="취소"
              confirmDisabled={isDeletePending}
              cancelDisabled={isDeletePending}
              showOverlay
              onConfirm={() => void handleDeleteChatRoom()}
              trigger={
                <button
                  type="button"
                  disabled={isDisabled}
                  className="mt-2 h-12 rounded-xl border border-[#F2B7B7] bg-[#FFF2F2] text-sm font-semibold text-[#DF454A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletePending ? "삭제 중..." : "채팅방 삭제"}
                </button>
              }
            />
          ) : null}
        </form>
      </section>

      <FixedActionBar>
        <PrimaryButton
          type="submit"
          form="edit-chat-room-form"
          disabled={!canSubmit || isDisabled}
        >
          {isEditPending ? "수정 중..." : "그룹 수정하기"}
        </PrimaryButton>
      </FixedActionBar>
    </>
  );
}
