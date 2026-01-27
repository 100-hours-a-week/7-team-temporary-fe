"use client";

import { useState } from "react";
import Picker from "react-mobile-picker";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

//수면시간 휠 컴포넌트
type SleepTimeValue = {
  hour: number;
  minute: number;
};

interface SleepTimePickerProps {
  value?: SleepTimeValue;
  onChange?: (value: SleepTimeValue) => void;
}

const DEFAULT_VALUE: SleepTimeValue = { hour: 22, minute: 30 };

export function SleepTimePicker({ value: valueProp, onChange }: SleepTimePickerProps) {
  const [internalValue, setInternalValue] = useState(DEFAULT_VALUE);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const handleChange = (nextValue: SleepTimeValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-14 -translate-y-1/2 rounded-full border border-red-400" />

      <Picker
        value={value}
        onChange={handleChange}
        height={180}
        itemHeight={56}
      >
        <Picker.Column name="hour">
          {HOURS.map((hour) => (
            <Picker.Item
              key={hour}
              value={hour}
            >
              <div className="text-xl font-semibold">{String(hour).padStart(2, "0")}시</div>
            </Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column name="minute">
          {MINUTES.map((minute) => (
            <Picker.Item
              key={minute}
              value={minute}
            >
              <div className="text-xl font-semibold">{String(minute).padStart(2, "0")}분</div>
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
    </div>
  );
}
