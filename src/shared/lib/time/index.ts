import { formatMinutesToHHmm, parseHHmmToMinutes } from "./hhmm";

export {
  formatHHmmRange,
  formatMinutesToHHmm,
  isValidHHmmRange,
  parseHHmmToMinutes,
  splitHHmmToParts,
} from "./hhmm";

/**
 * @deprecated parseHHmmToMinutes를 사용한다.
 */
export function parseTimeToMinutes(value: string | undefined | null) {
  return parseHHmmToMinutes(value);
}

/**
 * @deprecated formatMinutesToHHmm를 사용한다.
 */
export function formatTime(totalMinutes: number) {
  return formatMinutesToHHmm(totalMinutes);
}

/**
 * 슬롯 시작 시각과 길이(분)를 기반으로 시작/종료 시각 문자열을 만든다.
 * 종료 시각은 24시간을 기준으로 순환시켜 "HH:mm" 형식을 유지한다.
 */
export function buildTimeRange(hour: number, minute: number, durationMinutes: number) {
  const startMinutes = hour * 60 + minute;
  const endMinutes = startMinutes + durationMinutes;
  return {
    startAt: formatMinutesToHHmm(startMinutes),
    endAt: formatMinutesToHHmm(endMinutes),
  };
}

/**
 * 시작 시각에 길이(분)를 더해 종료 시각 문자열을 계산한다.
 * 시작 시각 파싱이 실패하면 원본 시작 문자열을 그대로 반환한다.
 */
export function buildTimeRangeFromStart(startAt: string, durationMinutes: number) {
  const startMinutes = parseHHmmToMinutes(startAt);
  if (startMinutes === null) return startAt;
  return formatMinutesToHHmm(startMinutes + durationMinutes);
}

/**
 * 종료 시각에서 길이(분)를 빼서 시작 시각 문자열을 계산한다.
 * 종료 시각 파싱이 실패하면 원본 종료 문자열을 그대로 반환한다.
 */
export function buildTimeRangeFromEnd(endAt: string, durationMinutes: number) {
  const endMinutes = parseHHmmToMinutes(endAt);
  if (endMinutes === null) return endAt;
  return formatMinutesToHHmm(endMinutes - durationMinutes);
}

/**
 * 주어진 시간 구간이 하루 마감 시각 제한을 넘는지 확인한다.
 * 입력 시간 파싱이 불가능한 경우에는 차단하지 않고 false를 반환한다.
 */
export function isAfterDayEnd(startAt: string, endAt: string, dayEndMinutes: number | null) {
  if (dayEndMinutes === null) return false;
  const startMinutes = parseHHmmToMinutes(startAt);
  const endMinutes = parseHHmmToMinutes(endAt);
  if (startMinutes === null || endMinutes === null) return false;
  return startMinutes >= dayEndMinutes || endMinutes > dayEndMinutes;
}
