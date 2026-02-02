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

export interface UpdateMyProfileImageRequestDto {
  imageKey: string;
}

export interface UpdatePasswordRequestDto {
  newPassword: string;
  checkNewPassword: string;
}
