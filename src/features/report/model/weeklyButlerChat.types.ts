export interface WeeklyButlerChatFormModel {
  message: string;
}

export interface WeeklyButlerChatRequestDto {
  reportId: number;
  inputMessage: string;
}

export interface WeeklyButlerChatUiState {
  isSendDisabled: boolean;
  isSendHidden: boolean;
  sentCount: number;
  remainingCount: number;
}
