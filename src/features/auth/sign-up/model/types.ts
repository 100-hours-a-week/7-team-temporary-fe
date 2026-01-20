export interface SignUpFormModel {
  email: string;
  password: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  birth: string; // YYYY.MM.DD
  focuseTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  dayEndTime: string; // HH:MM
  profileImageKey?: string;
}

export interface SignUpRequestDto {
  email: string;
  password: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  birth: string; // YYYY.MM.DD
  focuseTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  dayEndTime: string; // HH:MM
  profileImageKey?: string;
}
