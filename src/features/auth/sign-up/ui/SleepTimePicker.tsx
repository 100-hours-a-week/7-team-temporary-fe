"use client";

import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (nextValue: SleepTimeValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>, column: keyof SleepTimeValue) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const list = column === "hour" ? HOURS : MINUTES;
    const currentIndex = list.indexOf(value[column]);
    if (currentIndex < 0) return;
    const nextIndex = Math.max(0, Math.min(list.length - 1, currentIndex + direction));
    if (nextIndex === currentIndex) return;
    handleChange({ ...value, [column]: list[nextIndex] });
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    element.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overscroll-none"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-14 -translate-y-1/2 rounded-full border border-red-400" />

      <Picker
        value={value}
        onChange={handleChange}
        height={180}
        itemHeight={56}
      >
        <Picker.Column
          name="hour"
          onWheel={(event) => handleWheel(event, "hour")}
        >
          {HOURS.map((hour) => (
            <Picker.Item
              key={hour}
              value={hour}
            >
              <div className="text-xl font-semibold">{String(hour).padStart(2, "0")}시</div>
            </Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column
          name="minute"
          onWheel={(event) => handleWheel(event, "minute")}
        >
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
