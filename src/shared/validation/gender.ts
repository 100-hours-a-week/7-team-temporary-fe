export const GENDER_ERRORS = {
  REQUIRED: "성별을 선택해주세요.",
} as const;

export const getGenderError = (value: string) => {
  if (value !== "MALE" && value !== "FEMALE") {
    return GENDER_ERRORS.REQUIRED;
  }
  return undefined;
};

export const isGenderValid = (value: string) => !getGenderError(value);
