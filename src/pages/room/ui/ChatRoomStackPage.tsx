"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { chatRoomQueryKeys } from "@/entities/chat-room";
import { ChatRoomSession } from "@/widgets/chat-room-session";
import { useChatRoomStackHeader } from "./useChatRoomStackHeader";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId }: ChatRoomStackPageProps) {
  useChatRoomStackHeader({ roomId });

  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      void queryClient.invalidateQueries({ queryKey: chatRoomQueryKeys.listAll() });
    };
  }, [queryClient]);

  return <ChatRoomSession roomId={roomId} />;
}
