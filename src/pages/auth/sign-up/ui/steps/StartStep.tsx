import { WordRevealText } from "@/shared/ui";
import { AnimatedStar } from "./AnimatedStar";

export function StartStep() {
  const lines = ["반가워요!", "더 나은 하루를 만들어볼까요?"];

  return (
    <section className="flex flex-col items-center justify-center gap-6 text-center">
      <AnimatedStar />
      <WordRevealText
        lines={lines}
        className="text-secondary-100 text-2xl font-bold"
      />
    </section>
  );
}
