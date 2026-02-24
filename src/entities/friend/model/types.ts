export interface FriendListItemVM {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl: string | null;
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
