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
