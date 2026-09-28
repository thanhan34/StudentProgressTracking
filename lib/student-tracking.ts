import type { TaskProgress, WeeklyTaskResult, WeeklyReport } from "../data/students";

export const HOMEWORK_LABELS = {
  not_recorded: "Chưa ghi nhận", not_assigned: "Chưa giao bài", completed: "Có làm", incomplete: "Chưa làm / chưa hoàn thành",
} as const;
export const EXAM_LABELS = {
  not_assessed: "Chưa đánh giá", recommended: "Khuyến khích thi", not_yet: "Chưa khuyến khích thi",
} as const;

export function weeklyTrackingEntries(report: WeeklyReport): { label: string; value: string }[] {
  const entries: { label: string; value: string }[] = [];
  if (report.excusedAbsences != null) entries.push({ label: "Vắng có phép", value: `${report.excusedAbsences} buổi` });
  if (report.unexcusedAbsences != null) entries.push({ label: "Vắng không phép", value: `${report.unexcusedAbsences} buổi` });
  if (report.homeworkStatus && report.homeworkStatus !== "not_recorded" && HOMEWORK_LABELS[report.homeworkStatus]) {
    entries.push({ label: "Bài tập về nhà", value: HOMEWORK_LABELS[report.homeworkStatus] });
  }
  if (report.examRecommendation && report.examRecommendation !== "not_assessed" && EXAM_LABELS[report.examRecommendation]) {
    entries.push({ label: "Đánh giá thi", value: EXAM_LABELS[report.examRecommendation] });
  }
  if (report.limitations?.trim()) entries.push({ label: "Hạn chế trong tuần", value: report.limitations });
  return entries;
}

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