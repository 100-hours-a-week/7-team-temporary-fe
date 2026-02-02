"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">문제가 발생했습니다.</h1>
      <p className="max-w-xl text-sm text-gray-600">{error.message}</p>
      <button
        className="rounded-md bg-black px-4 py-2 text-sm text-white"
        onClick={reset}
        type="button"
      >
        다시 시도
      </button>
    </main>
  );
}
