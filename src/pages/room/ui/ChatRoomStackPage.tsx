"use client";

import { ChatRoomSession } from "@/widgets/chat-room-session";
import { useChatRoomStackHeader } from "./useChatRoomStackHeader";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId }: ChatRoomStackPageProps) {
  useChatRoomStackHeader({ roomId });

  return <ChatRoomSession roomId={roomId} />;
}
