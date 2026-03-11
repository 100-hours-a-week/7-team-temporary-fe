import { cn } from "@/shared/lib";
import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";

interface CamStudyControlDockProps {
  isCameraEnabled: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onToggleCamera: () => void;
}

export function CamStudyControlDock({
  isCameraEnabled,
  isMenuOpen,
  onToggleMenu,
  onToggleCamera,
}: CamStudyControlDockProps) {
  return (
    <FloatingActionDock
      className="flex flex-col items-end gap-3"
      offsetClassName="bottom-[30px]"
    >
      {isMenuOpen ? (
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-black">
            {isCameraEnabled ? "캠 끄기" : "캠 키기"}
          </span>
          <button
            type="button"
            onClick={onToggleCamera}
            className="bg-ink-900 hover:bg-primary-500 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors"
            aria-label={isCameraEnabled ? "캠 끄기" : "캠 켜기"}
          >
            <CamControlIcon isOff={isCameraEnabled} />
          </button>
        </div>
      ) : null}

      <FloatingActionButton
        icon="plus"
        label={isMenuOpen ? "캠 제어 메뉴 닫기" : "캠 제어 메뉴 열기"}
        onClick={onToggleMenu}
        className={cn(
          "bg-ink-900 hover:bg-primary-500 transition-transform duration-200",
          isMenuOpen && "rotate-45",
        )}
      />
    </FloatingActionDock>
  );
}

function CamControlIcon({ isOff }: { isOff: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="4"
      />
      <circle
        cx="12"
        cy="13"
        r="3.1"
      />
      {isOff ? <path d="M3 21L21 3" /> : null}
    </svg>
  );
}
