interface TimeSlotListProps {
  slots: number[];
}

export function TimeSlotList({ slots }: TimeSlotListProps) {
  return (
    <div className="mt-0">
      <div className="mb-[152px] flex flex-col gap-10">
        {slots.map((hour) => (
          <div
            key={hour}
            className="text-base font-semibold text-neutral-900"
          >
            {String(hour).padStart(2, "0")}:00
          </div>
        ))}
      </div>
    </div>
  );
}
