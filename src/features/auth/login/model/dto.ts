import type { LoginFormModel, LoginRequestDto } from "./types";

export function toLoginRequestDto(form: LoginFormModel): LoginRequestDto {
  return {
    email: form.email,
    password: form.password,
  };
}
