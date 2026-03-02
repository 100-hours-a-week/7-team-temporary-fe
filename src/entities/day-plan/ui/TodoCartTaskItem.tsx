import styled from "@emotion/styled";
import { formatHHmmRange } from "@/shared/lib";

import { TaskItemActionRow } from "./TaskItemActionRow";
import { toTaskItemModelFromTodoCart } from "../model/taskMappers";
import type { TaskItemModel, TodoCartTaskItemModel } from "../model/taskModels";

export type TodoCartViewMode = "UNASSIGNED" | "ARRANGED";

interface TodoCartTaskItemProps {
  task: TodoCartTaskItemModel;
  viewMode: TodoCartViewMode;
  onEdit: (task: TodoCartTaskItemModel) => void;
  onDelete: (scheduleId: number) => void;
}

const FLEX_TIME_HELPER_TEXT = "시간 자유롭게 배치, AI가 해결해줄게요!";
const EMPTY_TIME_TEXT = "시간 정보 없음";
const AI_RESTRICTION_TEXT = "AI 배정 작업은 일부 항목 수정이 제한됩니다.";
const URGENT_TEXT = "급해요!";

const VIEW_MODE_BADGE_TEXT: Record<TodoCartViewMode, string> = {
  UNASSIGNED: "미배치",
  ARRANGED: "배치 완료",
};

interface MetaItem {
  label: string;
  value: string;
  helper?: string;
}

interface BadgeItem {
  key: string;
  label: string;
  variant: "neutral" | "ai" | "arranged";
}

/**
 * 작업 바구니에서 단일 작업을 미리보기로 표시하는 카드.
 */
export function TodoCartTaskItem({ task, viewMode, onEdit, onDelete }: TodoCartTaskItemProps) {
  const taskItem = toTaskItemModelFromTodoCart(task);
  const isAiAssigned = taskItem.assignedBy === "AI";
  const badges = getBadges({ isAiAssigned, viewMode });
  const metaItems = buildMetaItems(taskItem);
  const helperTexts = metaItems
    .map((item) => item.helper)
    .filter((value): value is string => Boolean(value));

  return (
    <Card>
      <HeaderRow>
        <Title>{taskItem.title}</Title>
        <TaskItemActionRow
          onDelete={() => onDelete(taskItem.taskId)}
          onEdit={() => onEdit(task)}
        />
      </HeaderRow>
      <MetaList>
        {metaItems.map((item) => (
          <MetaItem key={`${item.label}-${item.value}`}>
            <MetaLabel>{item.label}</MetaLabel>
            <MetaValue>{item.value}</MetaValue>
          </MetaItem>
        ))}
        {helperTexts.map((text) => (
          <MetaHelper key={text}>{text}</MetaHelper>
        ))}
        {isAiAssigned ? <MetaHelper>{AI_RESTRICTION_TEXT}</MetaHelper> : null}
        {taskItem.isUrgent ? <UrgentText>{URGENT_TEXT}</UrgentText> : null}
      </MetaList>
      <FooterRow>
        <BadgeRow>
          {badges.map((badge) => (
            <Badge
              key={badge.key}
              $variant={badge.variant}
            >
              {badge.label}
            </Badge>
          ))}
        </BadgeRow>
      </FooterRow>
    </Card>
  );
}

function buildMetaItems(task: TaskItemModel): MetaItem[] {
  const items: MetaItem[] = [];

  if (task.focusLevel !== undefined) {
    items.push({
      label: "몰입도",
      value: `${task.focusLevel}단계`,
    });
  }

  items.push(getTimeMeta(task));

  return items;
}

function getTimeMeta(task: TaskItemModel): MetaItem {
  if (task.timeType === "FIXED") {
    return {
      label: "고정 시간",
      value: formatHHmmRange(task.startTime, task.endTime, EMPTY_TIME_TEXT),
    };
  }

  if (task.timeType === "ESTIMATED") {
    return {
      label: "예상 소요시간",
      value: formatEstimatedTimeRange(task.estimatedTimeRange),
      helper: FLEX_TIME_HELPER_TEXT,
    };
  }

  return {
    label: "배치 시간",
    value: formatHHmmRange(task.startTime, task.endTime, EMPTY_TIME_TEXT),
  };
}

function formatEstimatedTimeRange(value?: string | null) {
  if (!value) return EMPTY_TIME_TEXT;
  const labels: Record<string, string> = {
    MINUTE_UNDER_30: "30분 미만",
    MINUTE_30_TO_60: "30분~1시간",
    HOUR_1_TO_2: "1~2시간",
    HOUR_2_TO_4: "2~4시간",
    HOUR_OVER_4: "4시간 이상",
  };
  return labels[value] ?? value;
}

function getBadges({
  isAiAssigned,
  viewMode,
}: {
  isAiAssigned: boolean;
  viewMode: TodoCartViewMode;
}): BadgeItem[] {
  const items: BadgeItem[] = [
    {
      key: "view",
      label: VIEW_MODE_BADGE_TEXT[viewMode],
      variant: viewMode === "ARRANGED" ? "arranged" : "neutral",
    },
  ];

  if (isAiAssigned) {
    items.unshift({ key: "ai", label: "AI", variant: "ai" });
  }

  return items;
}

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 18px;
  border: 1px solid #f1f5f9;
  padding: 14px 21px 14px;
  background: #ffffff;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #111827;
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
  font-size: 14px;
`;

const MetaLabel = styled.span`
  min-width: 72px;
  font-weight: 600;
  color: #6b7280;
`;

const MetaValue = styled.span`
  font-weight: 600;
`;

const MetaHelper = styled.div`
  font-size: 13px;
  color: #b0b8c1;
  padding-left: 4px;
`;

const UrgentText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
  padding-left: 4px;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Badge = styled.span<{ $variant: BadgeItem["variant"] }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $variant }) => {
    if ($variant === "ai") return "#fecaca";
    if ($variant === "arranged") return "#ffffff";
    return "#e5e7eb";
  }};
  color: ${({ $variant }) =>
    $variant === "ai" ? "#dc2626" : $variant === "arranged" ? "#FF6D6D" : "#6b7280"};
  border: ${({ $variant }) =>
    $variant === "arranged" ? "1px solid rgb(255, 161, 161)" : "1px solid transparent"};
`;
