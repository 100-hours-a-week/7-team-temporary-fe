import { LoginPage } from "@/pages/login";
import { Icon } from "@/shared/ui/icon";

export default function Page() {
  return (
    <>
      <div className="transition-none">
        <div className="text-xl leading-tight font-bold text-neutral-500">
          몰입이 시작되는 <br />
          가장 작은 단위
        </div>
        <Icon
          name="logoDefault"
          className="h-auto w-full max-w-[200px] shrink"
        />
      </div>
      <LoginPage />
    </>
  );
}
