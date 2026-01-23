import { Icon } from "@/shared/ui";

export function AnimatedStar() {
  return (
    // 마운트 직후 팝-인, 이후 부유/회전 애니메이션 적용
    <span className="animate-pop-in inline-flex">
      <Icon
        name="starYellow"
        className="animate-float-rotate h-[120px] w-[120px]"
      />
    </span>
  );
}
