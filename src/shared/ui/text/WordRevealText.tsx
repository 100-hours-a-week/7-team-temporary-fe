import { cn } from "@/shared/lib";

interface WordRevealTextProps {
  lines: string[];
  className?: string;
  staggerMs?: number;
  wordClassName?: string;
}

export function WordRevealText({
  lines,
  className,
  staggerMs = 60,
  wordClassName,
}: WordRevealTextProps) {
  return (
    <div className={cn(className)}>
      {lines.map((line, lineIndex) => {
        const lineWords = line.split(" ");
        const lineStartIndex = lines
          .slice(0, lineIndex)
          .reduce((count, text) => count + text.split(" ").length, 0);

        return (
          <span key={`${line}-${lineIndex}`} className="block">
            {lineWords.map((word, wordIndex) => (
              <span
                key={`${word}-${wordIndex}`}
                className={cn("word-reveal inline-block", wordClassName)}
                style={{ animationDelay: `${(lineStartIndex + wordIndex) * staggerMs}ms` }}
              >
                {word}
                {wordIndex < lineWords.length - 1 ? "\u00A0" : null}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
}
