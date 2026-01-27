import type { UserEntity } from "@/entities/user/model";

export interface SignUpFormModel {
  email: string;
  password: string;
  nickname: string;
  gender: "MALE" | "FEMALE" | "";
  birth: string; // YYYY.MM.DD
  focusTimeZone: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | "";
  dayEndTime: string; // HH:MM
  profileImageKey?: string | null;
}

export type SignUpRequestDto = UserEntity & { password: string };

export interface SignUpResult {
  userId: number;
}
