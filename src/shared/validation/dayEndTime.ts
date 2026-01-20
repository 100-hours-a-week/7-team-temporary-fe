const DAY_END_TIME_REGEX = /^\d{2}:\d{2}$/;

export const getDayEndTimeError = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "하루 종료 시간을 입력해주세요.";
  if (!DAY_END_TIME_REGEX.test(trimmed)) {
    return "하루 종료 시간은 HH:MM 형식이어야 합니다.";
  }
  const [hour, minute] = trimmed.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return "하루 종료 시간은 HH:MM 형식이어야 합니다.";
  }
  return undefined;
};

export const isDayEndTimeValid = (value: string) => !getDayEndTimeError(value);
