interface LoginButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function LoginButton({ isDisabled, isLoading }: LoginButtonProps) {
  return (
    <button
      className="w-full rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      disabled={isDisabled || isLoading}
      type="submit"
    >
      {isLoading ? "로그인 중..." : "로그인"}
    </button>
  );
}
