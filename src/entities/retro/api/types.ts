export interface RetroCreateResponseDto {
  reflectionId: number;
}

export interface RetroImageInfoResponseDto {
  url?: string;
  expiresAt?: string;
  imageKey?: string;
  key?: string;
}

export interface MyRetroItemResponseDto {
  isMine?: boolean;
  onwerNickname?: string;
  ownerNickname?: string;
  reflectionId: number;
  isOpen?: boolean;
  title?: string;
  content?: string;
  likes?: number;
  isLikedByMe?: boolean;
  images?: RetroImageInfoResponseDto[];
  createdAt?: string;
}

export interface MyRetroListResponseDto {
  content: MyRetroItemResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type PublicRetroItemResponseDto = MyRetroItemResponseDto;
export type PublicRetroListResponseDto = MyRetroListResponseDto;
