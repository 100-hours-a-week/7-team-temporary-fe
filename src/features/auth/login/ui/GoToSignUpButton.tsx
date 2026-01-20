import Link from "next/link";

export function GoToSignUpButton() {
  return (
    <Link
      className="text-sm text-gray-600 underline"
      href="/sign-up/intro"
    >
      회원가입으로 이동
    </Link>
  );
}
