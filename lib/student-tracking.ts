import type { TaskProgress, WeeklyTaskResult } from "../data/students";

export const HOMEWORK_LABELS = {
  not_recorded: "Chưa ghi nhận", not_assigned: "Chưa giao bài", completed: "Có làm", incomplete: "Chưa làm / chưa hoàn thành",
} as const;
export const EXAM_LABELS = {
  not_assessed: "Chưa đánh giá", recommended: "Khuyến khích thi", not_yet: "Chưa khuyến khích thi",
} as const;

export function parseAssignees(value: string): string[] {
  return [...new Map(value.split(/[,\n]/).map((name) => name.trim()).filter(Boolean).map((name) => [name.toLocaleLowerCase("vi"), name])).values()];
}

export function validAbsences(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 0 && value <= 14);
}

export function applyWeeklyTask(task: TaskProgress, result: WeeklyTaskResult, previousPracticed: number, sync: boolean): TaskProgress {
  return {
    ...task,
    score: sync ? result.score : task.score,
    practiced: Math.max(0, task.practiced + result.practiced - previousPracticed),
    ...(sync ? { assigneeUsers: result.assigneeUsers ?? (result.assignees ? [] : task.assigneeUsers ?? []) } : {}),
    ...(sync ? { assignees: result.assignees ?? task.assignees ?? [], progressText: result.progressText ?? task.progressText ?? "", limitations: result.limitations ?? task.limitations ?? "" } : {}),
  };
}