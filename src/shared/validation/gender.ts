export const getGenderError = (value: string) => {
  if (value !== "MALE" && value !== "FEMALE") {
    return "성별을 선택해주세요.";
  }
  return undefined;
};

export const isGenderValid = (value: string) => !getGenderError(value);
