"use client";

import { useEffect } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { Icon } from "@/shared/ui/icon";
import { useStackPage } from "@/widgets/stack";

interface GroupChatMembersStackPageProps {
  roomId: number;
}

export function GroupChatMembersStackPage({ roomId }: GroupChatMembersStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const chatRoomDetailQuery = useChatRoomDetailQuery({ roomId });
  const detail = chatRoomDetailQuery.data;

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">그룹원 목록</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-8">
      {chatRoomDetailQuery.isLoading ? (
        <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-600">
          그룹원 목록을 불러오는 중...
        </div>
      ) : null}

      {chatRoomDetailQuery.isError ? (
        <div className="rounded-2xl bg-[#FFF2F2] px-4 py-6 text-center text-sm text-[#DF454A]">
          그룹원 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {detail ? (
        <>
          <ul className="flex flex-col gap-2">
            <GroupMemberListItem
              nickname={detail.owner.nickname}
              profileImageUrl={detail.owner.profileImageUrl}
              isOwner
            />

            {detail.participants.map((participant) => (
              <GroupMemberListItem
                key={participant.participantId ?? participant.userId}
                nickname={participant.nickname}
                profileImageUrl={participant.profileImageUrl}
                isOwner={false}
              />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

interface GroupMemberListItemProps {
  nickname: string;
  profileImageUrl: string | null;
  isOwner: boolean;
}

function GroupMemberListItem({ nickname, profileImageUrl, isOwner }: GroupMemberListItemProps) {
  const avatarLetter = nickname.charAt(0).toUpperCase() || "?";

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
        {profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImageUrl}
            alt={`${nickname} 프로필 이미지`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{avatarLetter}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <div className="truncate text-sm font-semibold text-neutral-900">{nickname}</div>
          {isOwner ? (
            <Icon
              name="crown"
              className="h-4 w-4 shrink-0 text-[#E0A100]"
              aria-label="방장"
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
