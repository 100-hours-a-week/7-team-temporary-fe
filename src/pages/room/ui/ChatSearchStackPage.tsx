"use client";

import { useCallback } from "react";

import type { ChatRoomSummaryDto } from "@/entities/chat-room";
import { ConfirmDialog } from "@/shared/ui";
import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { SearchBar } from "@/shared/ui/search";
import { useStackPage } from "@/widgets/stack";
import { useChatSearchStackHeader, useChatSearchStackPageModel } from "../model";
import { CreateChatRoomStackPage } from "./CreateChatRoomStackPage";
import { ChatRoomStackPage } from "./ChatRoomStackPage";

export function ChatSearchStackPage() {
  const { push } = useStackPage();
  const handleOpenCreateChatRoom = useCallback(() => {
    push(<CreateChatRoomStackPage />);
  }, [push]);
  const handleOpenChatRoom = useCallback(
    (roomId: number) => {
      push(<ChatRoomStackPage roomId={roomId} />);
    },
    [push],
  );
  useChatSearchStackHeader();
  const {
    keyword,
    setKeyword,
    handleSearchAction,
    searchListQuery,
    filteredRooms,
    selectedRoom,
    isJoinDialogOpen,
    handleOpenRoomDialog,
    handleJoinDialogOpenChange,
    handleJoinRoom,
    isJoinPending,
  } = useChatSearchStackPageModel({
    onJoinSuccess: handleOpenChatRoom,
  });

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-[110px]">
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        placeholder="채팅방 검색"
        maxLength={25}
        actionLabel="검색"
        actionDisabled={!keyword.trim()}
        onActionClick={handleSearchAction}
      />

      {searchListQuery.isLoading ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          채팅방 목록을 불러오는 중...
        </div>
      ) : searchListQuery.isError ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          채팅방 목록을 불러오지 못했습니다.
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          검색결과가 없습니다.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {filteredRooms.map((room) => (
            <li key={`chat-search-${room.roomId}`}>
              <ChatSearchRoomItem
                room={room}
                onClick={handleOpenRoomDialog}
              />
            </li>
          ))}
        </ul>
      )}

      <FloatingActionDock offsetClassName="bottom-[30px]">
        <FloatingActionButton
          icon="plus"
          label="채팅방 생성"
          onClick={handleOpenCreateChatRoom}
        />
      </FloatingActionDock>

      <ConfirmDialog
        open={isJoinDialogOpen}
        onOpenChange={handleJoinDialogOpenChange}
        title={selectedRoom?.title ?? ""}
        description={
          <div className="space-y-3">
            <p className="text-sm text-neutral-700">{selectedRoom?.description ?? ""}</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">
              <Icon
                name="user_filled"
                className="h-4 w-4 text-neutral-500"
                aria-hidden
              />
              <span>
                {selectedRoom?.participantsCount ?? 0}/{selectedRoom?.maxParticipants ?? 0}
              </span>
            </div>
          </div>
        }
        confirmText={isJoinPending ? "입장 중..." : "함께하기"}
        cancelText="취소"
        confirmDisabled={isJoinPending}
        cancelDisabled={isJoinPending}
        showOverlay
        onConfirm={() => void handleJoinRoom()}
        trigger={
          <button
            type="button"
            className="hidden"
            aria-hidden
            tabIndex={-1}
          />
        }
      />
    </section>
  );
}

interface ChatSearchRoomItemProps {
  room: ChatRoomSummaryDto;
  onClick: (room: ChatRoomSummaryDto) => void;
}

function ChatSearchRoomItem({ room, onClick }: ChatSearchRoomItemProps) {
  return (
    <button
      type="button"
      className="w-full rounded-[20px] border border-neutral-200 bg-white px-6 py-5 text-left"
      onClick={() => onClick(room)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-neutral-900">
          {room.title}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[14px] text-neutral-500">
          <Icon
            name="user_filled"
            className="h-5 w-5 text-neutral-500"
            aria-hidden
          />
          {room.participantsCount}/{room.maxParticipants}
        </span>
      </div>

      <p className="mt-2 truncate text-[14px] text-neutral-500">{room.description}</p>
    </button>
  );
}
