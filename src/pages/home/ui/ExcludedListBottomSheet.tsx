import { BottomSheet } from "@/shared/ui";

type ExcludedListBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function ExcludedListBottomSheet({
  open,
  onOpenChange,
  expanded,
  onExpandedChange,
  children,
  footer,
}: ExcludedListBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      peekHeight={12}
      expandHeight={35}
      enableDragHandle
      showOverlay={false}
      heightUnit="vh"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 px-6 pt-6">
          <div className="mb-[9px] text-xl font-semibold text-neutral-900">제외된 리스트</div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-6 pb-6">{children}</div>
        {footer ? (
          <div className="mt-auto shrink-0 px-6 pb-[env(safe-area-inset-bottom)]">{footer}</div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
