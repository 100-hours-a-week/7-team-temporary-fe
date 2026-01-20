import type { UseFormRegisterReturn } from "react-hook-form";

interface FocusTimeZoneSelectProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
}

export function FocusTimeZoneSelect({
  register,
  isDisabled,
}: FocusTimeZoneSelectProps) {
  return (
    <select
      className="w-full rounded-md border px-3 py-2"
      disabled={isDisabled}
      {...register}
    >
      <option value="MORNING">아침</option>
      <option value="AFTERNOON">오후</option>
      <option value="EVENING">저녁</option>
      <option value="NIGHT">밤</option>
    </select>
  );
}
