import Link from "next/link";

interface GoToSignUpButtonProps {
  onClick?: () => void;
  onPrepare?: () => void;
}

export function GoToSignUpButton({ onClick, onPrepare }: GoToSignUpButtonProps) {
  if (onClick) {
    return (
      <button
        className="text-center text-sm text-gray-600 underline"
        type="button"
        onClick={onClick}
        onMouseEnter={onPrepare}
        onFocus={onPrepare}
        onTouchStart={onPrepare}
      >
        회원가입으로 이동
      </button>
    );
  }

  return (
    <Link
      className="text-center text-sm text-gray-600 underline"
      href="/sign-up/intro"
    >
      회원가입으로 이동
    </Link>
  );
}
