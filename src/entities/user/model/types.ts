export interface UserEntity {
  email: string;
  nickname: string;
  gender: "MALE" | "FEMALE";
  birth: string; // YYYY.MM.DD
  focusTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  dayEndTime: string; // HH:MM
  profileImageKey?: string | null;
}
