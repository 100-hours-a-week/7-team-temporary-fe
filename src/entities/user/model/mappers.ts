import type {
  MyProfileResponseDto,
  UpdateMyProfileRequestDto,
  UpdatePasswordRequestDto,
} from "../api/types";
import type { MyProfileModel, UpdateMyProfileModel, UpdatePasswordModel } from "./types";

const normalizeBirth = (birth: string) =>
  birth.includes("-") ? birth.replaceAll("-", ".") : birth;

export const toMyProfileModel = (dto: MyProfileResponseDto): MyProfileModel => ({
  email: dto.email,
  nickname: dto.nickname,
  gender: dto.gender,
  birth: normalizeBirth(dto.birth),
  focusTimeZone: dto.focusTimeZone,
  dayEndTime: dto.dayEndTime,
  profileImageKey: dto.profileImage?.key ?? null,
  profileImageUrl: dto.profileImage?.url ?? null,
  profileImageExpiresAt: dto.profileImage?.expiresAt ?? null,
});

export const toUpdateMyProfileRequestDto = (
  model: UpdateMyProfileModel,
): UpdateMyProfileRequestDto => ({
  gender: model.gender,
  birth: model.birth,
  focusTimeZone: model.focusTimeZone,
  dayEndTime: model.dayEndTime,
  nickname: model.nickname,
});

export const toUpdatePasswordRequestDto = (
  model: UpdatePasswordModel,
): UpdatePasswordRequestDto => ({
  newPassword: model.password,
  checkNewPassword: model.passwordConfirm,
});
