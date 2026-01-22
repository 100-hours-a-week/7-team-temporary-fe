import type { UseFormRegisterReturn } from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";

import { SelectCard } from "@/shared/ui/button";

interface GenderSelectProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
  invalid?: boolean;
  cardClassName?: string;
}

export function GenderSelect({ register, isDisabled, invalid, cardClassName }: GenderSelectProps) {
  const { control } = useFormContext();
  const selectedValue = useWatch({
    control,
    name: register.name,
  });

  const options = [
    { value: "MALE", title: "남성", description: "남성" },
    { value: "FEMALE", title: "여성", description: "여성" },
  ];

  const handleSelect = (value: string) => {
    register.onChange({ target: { name: register.name, value } });
  };

  return (
    <div
      className="flex w-full flex-row gap-3"
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
          description=""
          selected={selectedValue === option.value}
          disabled={isDisabled}
          onClick={() => handleSelect(option.value)}
          className={`h-[50px] [&>div]:flex [&>div]:w-full [&>div]:flex-row [&>div]:items-center [&>div]:justify-center [&>div]:gap-0 [&>div]:text-center [&>div]:align-middle [&>div>span:first-child]:w-full ${cardClassName ?? ""}`.trim()}
        />
      ))}
    </div>
  );
}
