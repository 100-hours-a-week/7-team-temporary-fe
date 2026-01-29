import { Icon } from "@/shared/ui";

export default function Home() {
  return (
    <main className="bg-secondary-800 flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Icon
        name="logoWhite"
        className="h-auto w-full max-w-[200px] shrink-0"
      />
      <p className="text-secondary-100 text-base font-semibold">
        몰입의 <span className="text-primary-600">시작</span>
      </p>
    </main>
  );
}
