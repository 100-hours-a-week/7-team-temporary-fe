/**
 * "HH:mm" 형식 문자열을 분 단위 숫자로 변환한다.
 * 입력이 비어 있거나 포맷이 잘못되었거나 범위를 벗어나면 null을 반환한다.
 */
export function parseTimeToMinutes(value: string | undefined | null) {
  if (!value) return null;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

/**
 * 분 단위 값을 24시간제 "HH:mm" 문자열로 변환한다.
 * 음수는 0으로 보정하고, 24시간을 넘는 값은 하루 기준으로 순환시킨다.
 */
export function formatTime(totalMinutes: number) {
  const minutes = Math.max(0, totalMinutes);
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * 슬롯 시작 시각과 길이(분)를 기반으로 시작/종료 시각 문자열을 만든다.
 * 종료 시각은 24시간을 기준으로 순환시켜 "HH:mm" 형식을 유지한다.
 */
export function buildTimeRange(hour: number, minute: number, durationMinutes: number) {
  const startMinutes = hour * 60 + minute;
  const endMinutes = (startMinutes + durationMinutes) % (24 * 60);
  return {
    startAt: formatTime(startMinutes),
    endAt: formatTime(endMinutes),
  };
}

/**
 * 시작 시각에 길이(분)를 더해 종료 시각 문자열을 계산한다.
 * 시작 시각 파싱이 실패하면 원본 시작 문자열을 그대로 반환한다.
 */
export function buildTimeRangeFromStart(startAt: string, durationMinutes: number) {
  const [hourText, minuteText] = startAt.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return startAt;
  }
  const totalMinutes = hour * 60 + minute + durationMinutes;
  return formatTime(totalMinutes);
}

/**
 * 종료 시각에서 길이(분)를 빼서 시작 시각 문자열을 계산한다.
 * 종료 시각 파싱이 실패하면 원본 종료 문자열을 그대로 반환한다.
 */
export function buildTimeRangeFromEnd(endAt: string, durationMinutes: number) {
  const endMinutes = parseTimeToMinutes(endAt);
  if (endMinutes === null) return endAt;
  const startMinutes = endMinutes - durationMinutes;
  return formatTime(startMinutes);
}

/**
 * 주어진 시간 구간이 하루 마감 시각 제한을 넘는지 확인한다.
 * 입력 시간 파싱이 불가능한 경우에는 차단하지 않고 false를 반환한다.
 */
export function isAfterDayEnd(startAt: string, endAt: string, dayEndMinutes: number | null) {
  if (dayEndMinutes === null) return false;
  const startMinutes = parseTimeToMinutes(startAt);
  const endMinutes = parseTimeToMinutes(endAt);
  if (startMinutes === null || endMinutes === null) return false;
  return startMinutes >= dayEndMinutes || endMinutes > dayEndMinutes;
}
