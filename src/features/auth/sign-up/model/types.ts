import type { UserEntity } from "@/entities/user";

export interface SignUpFormModel {
  email: string;
  isEmailChecked: boolean;
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
  accessToken: string;
}
