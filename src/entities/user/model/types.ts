export type UserEmail = string;
export type UserNickname = string;
export type UserGender = "MALE" | "FEMALE";
export type UserBirth = string; // YYYY.MM.DD
export type UserFocusTimeZone = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
export type UserDayEndTime = string; // HH:MM
export type UserProfileImageKey = string | null;

export interface UserEntity {
  email: UserEmail;
  nickname: UserNickname;
  gender: UserGender;
  birth: UserBirth;
  focusTimeZone: UserFocusTimeZone;
  dayEndTime: UserDayEndTime;
  profileImageKey?: UserProfileImageKey;
}

export interface MyProfileModel extends UserEntity {
  profileImageUrl: string | null;
  profileImageExpiresAt: string | null;
}

export interface UpdateMyProfileModel {
  gender: UserGender;
  birth: UserBirth;
  focusTimeZone: UserFocusTimeZone;
  dayEndTime: UserDayEndTime;
  nickname: UserNickname;
}

export interface UpdateMyProfileImageModel {
  imageKey: string;
  profileImageUrl?: string | null;
}

export interface UpdatePasswordModel {
  password: string;
  passwordConfirm: string;
}
