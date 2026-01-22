import type { UseFormRegisterReturn } from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";

import { SelectCard } from "@/shared/ui/button";

interface FocusTimeZoneSelectProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function FocusTimeZoneSelect({ register, isDisabled, invalid }: FocusTimeZoneSelectProps) {
  const { control } = useFormContext();
  const selectedValue = useWatch({
    control,
    name: register.name,
  });

  const options = [
    { value: "MORNING", title: "아침", description: "8시 - 12시" },
    { value: "AFTERNOON", title: "오후", description: "12시 - 18시" },
    { value: "EVENING", title: "저녁", description: "18시 - 21시" },
    { value: "NIGHT", title: "밤", description: "21시 - 8시" },
  ];

  const handleSelect = (value: string) => {
    register.onChange({ target: { name: register.name, value } });
  };

  return (
    <div
      className="flex w-full flex-col gap-3"
      data-invalid={invalid || undefined}
    >
      <input
        type="hidden"
        {...register}
      />
      {options.map((option) => (
        <SelectCard
          key={option.value}
          title={option.title}
          description={option.description}
          selected={selectedValue === option.value}
          disabled={isDisabled}
          onClick={() => handleSelect(option.value)}
        />
      ))}
    </div>
  );
}
