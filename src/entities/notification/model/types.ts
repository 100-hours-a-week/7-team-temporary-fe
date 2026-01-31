export interface NotificationItemDto {
  notificationId?: number;
  id?: number;
  title?: string;
  content?: string;
  body?: string;
  createdAt?: string;
  sentAt?: string;
  scheduledAt?: string;
  status?: string;
  type?: string;
  isRead?: boolean;
}

export interface NotificationListResponseDto {
  content: NotificationItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
