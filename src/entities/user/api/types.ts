export interface MyProfileResponseDto {
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  birth: string;
  focusTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  dayEndTime: string;
  profileImage: {
    url: string;
    expiresAt: string;
    key: string;
  } | null;
}

export interface UpdateMyProfileRequestDto {
  gender: "MALE" | "FEMALE";
  birth: string;
  focusTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  dayEndTime: string;
  nickname: string;
}
