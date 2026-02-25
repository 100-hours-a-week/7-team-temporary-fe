export interface FriendProfileImageResponseDto {
  url?: string;
  expiresAt?: string;
  key?: string;
}

export interface FriendItemResponseDto {
  friendUserId: number;
  friendEmail?: string;
  friendNickname?: string;
  profileImage?: FriendProfileImageResponseDto | null;
}

export interface FriendListResponseDto {
  content: FriendItemResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FriendSearchItemResponseDto {
  userId: number;
  nickname?: string;
  email?: string;
  profileImage?: FriendProfileImageResponseDto | null;
  isFriend?: boolean;
}

export interface FriendSearchResponseDto {
  content: FriendSearchItemResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateFriendRequestResponseDto {
  requestId: number;
}
