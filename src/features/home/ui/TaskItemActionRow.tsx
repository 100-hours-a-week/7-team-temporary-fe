import styled from "@emotion/styled";

import { Icon } from "@/shared/ui/icon";

interface TaskItemActionRowProps {
  onEdit: () => void;
  onDelete: () => void;
  isDisabled?: boolean;
  editAriaLabel?: string;
  deleteAriaLabel?: string;
  gap?: string;
  className?: string;
}

const DEFAULT_EDIT_LABEL = "작업 편집";
const DEFAULT_DELETE_LABEL = "작업 삭제";
const DEFAULT_GAP = "0px";

export function TaskItemActionRow({
  onEdit,
  onDelete,
  isDisabled = false,
  editAriaLabel = DEFAULT_EDIT_LABEL,
  deleteAriaLabel = DEFAULT_DELETE_LABEL,
  gap = DEFAULT_GAP,
  className,
}: TaskItemActionRowProps) {
  return (
    <ActionRow
      className={className}
      $gap={gap}
    >
      <IconButton
        type="button"
        onClick={onDelete}
        aria-label={deleteAriaLabel}
        disabled={isDisabled}
      >
        <ActionIcon
          name="delete"
          aria-hidden="true"
          focusable="false"
        />
      </IconButton>
      <IconButton
        type="button"
        onClick={onEdit}
        aria-label={editAriaLabel}
        disabled={isDisabled}
      >
        <ActionIcon
          name="edit"
          aria-hidden="true"
          focusable="false"
        />
      </IconButton>
    </ActionRow>
  );
}

const ActionRow = styled.div<{ $gap: string }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ $gap }) => $gap};
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  box-sizing: content-box;
  border: none;
  background: #ffffff;
  padding: 0;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #111827;
  }

  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  &:disabled:hover {
    color: #9ca3af;
  }
`;

const ActionIcon = styled(Icon)`
  width: 1.35em;
  height: 1.35em;
  overflow: visible;
`;
