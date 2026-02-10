type ResetStateSetter<T> = (value: T | null) => void;
type RefObject<T> = { current: T };

type ResetDragStateParams<ActiveDrag, DraggingType, PreviewSlot, InsertPreview> = {
  setActiveDrag: ResetStateSetter<ActiveDrag>;
  setDraggingType: ResetStateSetter<DraggingType>;
  setPreviewSlot: ResetStateSetter<PreviewSlot>;
  setInsertPreview: ResetStateSetter<InsertPreview>;
  previewKeyRef: RefObject<string | null>;
  insertKeyRef: RefObject<string | null>;
  dragDurationRef: RefObject<number>;
  defaultDurationMinutes: number;
  restoreScrollPosition: () => void;
};

export function resetDragState<ActiveDrag, DraggingType, PreviewSlot, InsertPreview>({
  setActiveDrag,
  setDraggingType,
  setPreviewSlot,
  setInsertPreview,
  previewKeyRef,
  insertKeyRef,
  dragDurationRef,
  defaultDurationMinutes,
  restoreScrollPosition,
}: ResetDragStateParams<ActiveDrag, DraggingType, PreviewSlot, InsertPreview>) {
  setActiveDrag(null);
  setDraggingType(null);
  setPreviewSlot(null);
  previewKeyRef.current = null;
  setInsertPreview(null);
  insertKeyRef.current = null;
  dragDurationRef.current = defaultDurationMinutes;
  restoreScrollPosition();
}
