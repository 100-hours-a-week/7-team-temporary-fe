import type { SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

import { IconMap, type IconName } from "./map";

// Icon 컴포넌트가 받을 props 타입을 정의한다.
type IconProps = SVGProps<SVGSVGElement> & {
  // IconMap에서 사용할 아이콘 이름이다. (정해진 이름만 받을 수 있도록 타입으로 제한한다)
  name: IconName;
};

/**
 * SVG 아이콘을 이름으로 선택해서 렌더하는 팩토리 컴포넌트다.
 * - name으로 IconMap에서 SVG 컴포넌트를 찾아 렌더한다.
 */
export function Icon({ name, className, ...props }: IconProps) {
  // IconMap에서 name에 해당하는 SVG 컴포넌트를 가져온다.
  const SvgIcon = IconMap[name];

  if (!SvgIcon) {
    console.warn(`아이콘을 찾을 수 없습니다.: ${name}`);
    return null;
  }

  // 실제 SVG 컴포넌트를 렌더한다.
  return (
    <SvgIcon
      className={cn("inline-flex", className)}
      {...props}
    />
  );
}
