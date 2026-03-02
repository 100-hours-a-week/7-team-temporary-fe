"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchChatRoomSearchList, type ChatRoomSummaryDto } from "@/entities/chat-room";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui";
import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { SearchBar } from "@/shared/ui/search";
import { useStackPage } from "@/widgets/stack";
import { CreateChatRoomStackPage } from "./CreateChatRoomStackPage";
import { ChatRoomStackPage } from "./ChatRoomStackPage";

export function ChatSearchStackPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomSummaryDto | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { push, setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방 찾기</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  const handleOpenCreateChatRoom = () => {
    push(<CreateChatRoomStackPage />);
  };

  const normalizedKeyword = keyword.trim();
  const searchListQuery = useQuery({
    queryKey: ["chat-room-search", normalizedKeyword, 1, 100],
    queryFn: ({ signal }) =>
      fetchChatRoomSearchList({ title: normalizedKeyword, page: 1, size: 100, signal }),
  });
  const filteredRooms = searchListQuery.data?.content ?? [];

  const handleOpenRoomDialog = (room: ChatRoomSummaryDto) => {
    setSelectedRoom(room);
    setIsJoinDialogOpen(true);
  };

  const handleOpenChatRoom = (roomId: number) => {
    push(<ChatRoomStackPage roomId={roomId} />);
  };

  const handleJoinRoom = () => {
    if (!selectedRoom) return;
    handleOpenChatRoom(selectedRoom.roomId);
    setIsJoinDialogOpen(false);
    setSelectedRoom(null);
  };

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-[110px]">
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        placeholder="채팅방 검색"
        maxLength={25}
        actionLabel="검색"
        actionDisabled={!keyword.trim()}
        onActionClick={() => setKeyword((prev) => prev.trim())}
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

      <Dialog
        open={isJoinDialogOpen}
        onOpenChange={(open) => {
          setIsJoinDialogOpen(open);
          if (!open) {
            setSelectedRoom(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] rounded-3xl bg-white p-0 text-center sm:max-w-[425px] [&>button]:hidden">
          <div className="px-6 pt-6 pb-6">
            <DialogTitle className="text-lg font-semibold text-neutral-900">
              {selectedRoom?.title ?? ""}
            </DialogTitle>
            <DialogDescription className="mt-3 text-sm text-neutral-700">
              {selectedRoom?.description ?? ""}
            </DialogDescription>

            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">
              <Icon
                name="user_filled"
                className="h-4 w-4 text-neutral-500"
                aria-hidden
              />
              <span>
                {selectedRoom?.participantsCount ?? 0}/{selectedRoom?.maxParticipants ?? 0}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-12 w-full rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-500"
                >
                  취소
                </button>
              </DialogClose>
              <button
                type="button"
                onClick={handleJoinRoom}
                className="bg-primary-700 hover:bg-primary-700 h-12 w-full rounded-xl text-sm font-semibold text-white"
              >
                함께하기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
