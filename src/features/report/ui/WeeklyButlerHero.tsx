export function WeeklyButlerHero() {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary-200 relative flex h-20 w-20 items-center justify-center rounded-full text-4xl">
        🐹
        <span
          className="bg-primary-200 absolute right-1.5 bottom-0 h-3 w-3 rotate-45 rounded-[2px]"
          aria-hidden
        />
      </div>
      <p className="mt-3 text-center text-xl font-semibold text-black">
        이번 주, 무엇을 도와드릴까요?
      </p>
    </div>
  );
}
