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
  relationStatus?: FriendRelationStatusDto;
}

export interface FriendSearchResponseDto {
  content: FriendSearchItemResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FriendRequestItemResponseDto {
  requestId: number;
  fromUserId: number;
  fromUserEmail?: string;
  fromUserNickname?: string;
  profileImage?: FriendProfileImageResponseDto | null;
  createdAt?: string;
}

export interface FriendRequestListResponseDto {
  content: FriendRequestItemResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type FriendRelationStatusDto = "NONE" | "PENDING" | "FRIEND" | "SELF";

export type FriendRequestStatus = "ACCEPTED";

export interface UpdateFriendRequestStatusRequestDto {
  status: FriendRequestStatus;
}

export interface CreateFriendRequestResponseDto {
  requestId: number;
}
