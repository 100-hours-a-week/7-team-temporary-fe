"use client";

import { useState } from "react";
import Picker from "react-mobile-picker";

const HOURS = Array.from({ length: 24 }, (_, i) => i + 1);
const MINUTES = [0, 10, 20, 30, 40, 50];

//수면시간 휠 컴포넌트
export function SleepTimePicker() {
  const [value, setValue] = useState({
    hour: 22,
    minute: 30,
  });

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-14 -translate-y-1/2 rounded-full border border-red-400" />

      <Picker
        value={value}
        onChange={setValue}
        height={180}
        itemHeight={56}
      >
        <Picker.Column name="hour">
          {HOURS.map((hour) => (
            <Picker.Item
              key={hour}
              value={hour}
            >
              <div className="text-xl font-semibold">{hour}시</div>
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
