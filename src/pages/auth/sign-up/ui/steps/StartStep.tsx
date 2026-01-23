import { AnimatedStar } from "./AnimatedStar";

export function StartStep() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 text-center">
      <AnimatedStar />
      <div className="text-2xl font-bold text-neutral-900">
        반가워요!
        <br />더 나은 하루를 만들어볼까요?
      </div>
    </section>
  );
}
