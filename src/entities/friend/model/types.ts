export type FriendRelationStatus = "NONE" | "PENDING" | "FRIEND" | "SELF";

export interface FriendListItemVM {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
  relationStatus: FriendRelationStatus;
}

export interface FriendRequestItemVM extends FriendListItemVM {
  requestId: number;
  requestedAt: string;
}

export interface FriendListModel {
  content: FriendListItemVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FriendRequestListModel {
  content: FriendRequestItemVM[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
