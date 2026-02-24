import type { FriendItemResponseDto, FriendListResponseDto } from "./types";

const FRIEND_MOCK_ITEMS: FriendItemResponseDto[] = [
  {
    friendUserId: 5,
    friendEmail: "email05@email.com",
    friendNickname: "nick05",
    profileImage: {
      url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-5",
    },
  },
  {
    friendUserId: 7,
    friendEmail: "email07@email.com",
    friendNickname: "nick07",
    profileImage: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-7",
    },
  },
  {
    friendUserId: 9,
    friendEmail: "email09@email.com",
    friendNickname: "nick09",
    profileImage: null,
  },
  {
    friendUserId: 11,
    friendEmail: "email11@email.com",
    friendNickname: "nick11",
    profileImage: {
      url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-11",
    },
  },
  {
    friendUserId: 13,
    friendEmail: "email13@email.com",
    friendNickname: "nick13",
    profileImage: null,
  },
  {
    friendUserId: 15,
    friendEmail: "email15@email.com",
    friendNickname: "nick15",
    profileImage: {
      url: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-15",
    },
  },
  {
    friendUserId: 17,
    friendEmail: "email17@email.com",
    friendNickname: "nick17",
    profileImage: null,
  },
  {
    friendUserId: 19,
    friendEmail: "email19@email.com",
    friendNickname: "nick19",
    profileImage: {
      url: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-19",
    },
  },
  {
    friendUserId: 21,
    friendEmail: "email21@email.com",
    friendNickname: "nick21",
    profileImage: null,
  },
  {
    friendUserId: 23,
    friendEmail: "email23@email.com",
    friendNickname: "nick23",
    profileImage: {
      url: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-23",
    },
  },
  {
    friendUserId: 25,
    friendEmail: "email25@email.com",
    friendNickname: "nick25",
    profileImage: null,
  },
  {
    friendUserId: 27,
    friendEmail: "email27@email.com",
    friendNickname: "nick27",
    profileImage: {
      url: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=320&q=80",
      expiresAt: "2026-01-13T11:10:00+09:00",
      key: "friend-profile-27",
    },
  },
];

interface GetMockFriendsResponseOptions {
  page?: number;
  size?: number;
}

export function getMockFriendsResponse({
  page = 1,
  size = 10,
}: GetMockFriendsResponseOptions = {}): FriendListResponseDto {
  const safePage = Math.max(page, 1);
  const safeSize = Math.max(size, 1);
  const offset = (safePage - 1) * safeSize;
  const pagedItems = FRIEND_MOCK_ITEMS.slice(offset, offset + safeSize);

  return {
    content: pagedItems,
    page: safePage,
    size: safeSize,
    totalElements: FRIEND_MOCK_ITEMS.length,
    totalPages: Math.ceil(FRIEND_MOCK_ITEMS.length / safeSize),
  };
}
