export interface WeeklyButlerChatFormModel {
  message: string;
}

export interface WeeklyButlerChatRequestDto {
  inputMessage: string;
}

export interface WeeklyButlerChatUiState {
  isSendDisabled: boolean;
  isSendHidden: boolean;
  sentCount: number;
  remainingCount: number;
}
