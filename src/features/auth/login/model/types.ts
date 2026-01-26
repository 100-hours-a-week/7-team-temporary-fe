import type { UserEmail } from "@/entities/user";

export interface LoginFormModel {
  email: UserEmail;
  password: string;
}

export interface LoginRequestDto {
  email: UserEmail;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
