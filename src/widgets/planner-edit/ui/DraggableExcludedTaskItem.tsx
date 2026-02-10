"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { ExcludedTaskItem } from "@/features/home";
import type { EditableTaskItemModel } from "@/entities/day-plan";

type DraggableExcludedTaskItemProps = {
  task: EditableTaskItemModel;
};

export function DraggableExcludedTaskItem({ task }: DraggableExcludedTaskItemProps) {
  const id = `excluded-${task.scheduleId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { id, task, type: "excluded" },
  });
  const baseTransform = CSS.Translate.toString(transform);
  const style = {
    transform: isDragging
      ? `${baseTransform ? `${baseTransform} ` : ""}scale(1.03)`
      : baseTransform,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "0 18px 36px rgba(15, 23, 42, 0.28)" : "none",
    touchAction: "none",
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid={`excluded-task-${task.scheduleId}`}
    >
      <ExcludedTaskItem
        task={task}
        onRestore={() => undefined}
      />
    </div>
  );
}
