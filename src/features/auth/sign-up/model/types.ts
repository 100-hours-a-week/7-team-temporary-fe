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
  terms: Array<{ termsId: number; isAgreed: boolean }>;
}

export type SignUpRequestDto = UserEntity & {
  password: string;
  terms: Array<{ termsId: number; isAgreed: boolean }>;
};

export interface SignUpResult {
  userId: number;
}
