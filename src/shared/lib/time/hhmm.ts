const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const DAY_MINUTES = 24 * 60;

/**
 * "HH:mm" 형식 문자열을 분 단위 숫자로 변환한다.
 * 입력이 비어 있거나 포맷이 잘못되면 null을 반환한다.
 */
export function parseHHmmToMinutes(value: string | undefined | null) {
  if (!value) return null;
  const trimmed = value.trim();
  const match = HHMM_REGEX.exec(trimmed);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour * 60 + minute;
}

/**
 * 분 단위 값을 24시간제 "HH:mm" 문자열로 변환한다.
 * 음수는 0으로 보정하고, 24시간을 넘는 값은 하루 기준으로 순환시킨다.
 */
export function formatMinutesToHHmm(totalMinutes: number) {
  const clampedMinutes = Math.max(0, totalMinutes);
  const normalizedMinutes = clampedMinutes % DAY_MINUTES;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * 시작/종료 시각 문자열을 "HH:mm ~ HH:mm" 형태로 반환한다.
 * 둘 중 하나라도 없으면 fallbackText를 반환한다.
 */
export function formatHHmmRange(
  startAt: string | undefined | null,
  endAt: string | undefined | null,
  fallbackText = "시간 정보 없음",
) {
  if (!startAt || !endAt) return fallbackText;
  return `${startAt} ~ ${endAt}`;
}

/**
 * 시작/종료 시각이 모두 유효하고 종료가 시작보다 늦은지 검사한다.
 */
export function isValidHHmmRange(startAt: string, endAt: string) {
  const startMinutes = parseHHmmToMinutes(startAt);
  const endMinutes = parseHHmmToMinutes(endAt);
  if (startMinutes === null || endMinutes === null) return false;
  return endMinutes > startMinutes;
}

/**
 * "HH:mm"을 form select용 "H"/"M" 값으로 분리한다.
 * 파싱이 불가능하면 빈 문자열을 반환한다.
 */
export function splitHHmmToParts(value: string | undefined | null) {
  const minutes = parseHHmmToMinutes(value);
  if (minutes === null) {
    return { hour: "", minute: "" };
  }

  return {
    hour: String(Math.floor(minutes / 60)),
    minute: String(minutes % 60),
  };
}
