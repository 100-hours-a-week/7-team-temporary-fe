import { SplitText } from "@/shared/ui";
import { AnimatedStar } from "./AnimatedStar";

export function StartStep() {
  const lines = ["반가워요!", "더 나은 하루를 만들어볼까요?"];

  return (
    <section className="text-ink-800 mx-auto flex h-full max-w-[290px] flex-col items-center justify-center gap-6 text-center">
      <AnimatedStar />
      <SplitText
        text={lines.join(" ")}
        className="text-center text-2xl font-semibold mb-12"
        delay={30}
        duration={1.25}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
        onLetterAnimationComplete={() => {}}
      />
    </section>
  );
}
