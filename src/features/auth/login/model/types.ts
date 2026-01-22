export interface LoginFormModel {
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
