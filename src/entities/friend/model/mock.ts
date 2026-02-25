import type { FriendRequestItemVM } from "./types";

export const FRIEND_REQUEST_MOCKS: FriendRequestItemVM[] = [
  {
    requestId: 5005,
    id: 1005,
    nickname: "newfriend05",
    email: "newfriend05@email.com",
    isFriend: false,
    profileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
    requestedAt: "2026-02-22T09:14:00+09:00",
  },
  {
    requestId: 5003,
    id: 1003,
    nickname: "newfriend03",
    email: "newfriend03@email.com",
    isFriend: false,
    profileImageUrl: null,
    requestedAt: "2026-02-22T08:36:00+09:00",
  },
  {
    requestId: 5001,
    id: 1001,
    nickname: "newfriend01",
    email: "newfriend01@email.com",
    isFriend: false,
    profileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80",
    requestedAt: "2026-02-21T21:10:00+09:00",
  },
];
