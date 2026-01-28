import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/shared/ui";
import { cn } from "@/shared/lib";

//BaseInput : HTML <input>의 wrapper
//form 라이브러리(RHF)와의 연결을 위해 사용
//Input(BaseInput)의 책임 :
//상태에 따른 스타일 변경
//접근성 속성 (aria-invalid)
//focus / hover / disabled UX

//InputHTMLAttributes : HTMLInputElement의 속성을 모두 사용할 수 있게 해줌(Input태그에 들어가는 모든 속성)
//UseFormRegisterReturn : react-hook-form의 register 함수의 반환 타입
//register : RHF의 register 함수를 통해 생성된 객체
export const BASE_INPUT_CLASS_NAME = [
  // base
  "h-12 w-full rounded-xl border px-3 py-2 text-sm",
  "bg-neutral-50",
  "placeholder:text-gray-400",

  // default
  "border border-transparent",

  // focus / typing
  "focus:outline-none",
  "focus:ring-error/20 focus:ring-2 focus:ring-inset",
  "not-placeholder-shown:border-gray-400",

  // disabled
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",

  // error
  "data-[invalid=true]:border-red-500",
  "data-[invalid=true]:focus:border-red-500",
  "data-[invalid=true]:focus:ring-red-200",
].join(" ");

interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "aria-invalid"> {
  register: UseFormRegisterReturn;
  invalid?: boolean;
}

export function BaseInput({ register, invalid, className, ...props }: BaseInputProps) {
  return (
    <Input
      {...props}
      {...register}
      aria-invalid={invalid} //aria-invalid : 접근성 속성, invalid : 상태에 따른 스타일 변경
      data-invalid={invalid || undefined}
      className={cn(BASE_INPUT_CLASS_NAME, className)}
    />
  );
}
