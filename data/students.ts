import type { AssignedUser } from "../lib/staff";

export const STUDENT_STATUSES = ["Đã đăng ký thi", "Đã thi đậu", "Đang học", "Bảo Lưu", "Bỏ học"] as const;
export type StudentStatus = typeof STUDENT_STATUSES[number];

export const STUDENT_TAGS = ["Có thể thi được", "Cần thi gấp", "Cần hỗ trợ đặc biệt"] as const;
export type StudentTag = typeof STUDENT_TAGS[number];

export function normalizeStudentTags(value: unknown): StudentTag[] {
  return Array.isArray(value) ? STUDENT_TAGS.filter((tag) => value.includes(tag)) : [];
}

export function normalizeStudentStatus(value: unknown): StudentStatus {
  return STUDENT_STATUSES.find((status) => status === value) ?? "Đang học";
}
export type StudyPhase = "Nền tảng" | "Luyện task" | "Mock test" | "Nước rút";
export type PteSkill = "Speaking" | "Writing" | "Reading" | "Listening";

export type TaskNotes = { assignees?: string[]; assigneeUsers?: AssignedUser[]; progressText?: string; limitations?: string };
export type HomeworkStatus = "not_recorded" | "not_assigned" | "completed" | "incomplete";
export type ExamRecommendation = "not_assessed" | "recommended" | "not_yet";
export type TaskProgress = TaskNotes & { code: string; name: string; skill: PteSkill; score: number; target: number; practiced: number };
export type WeeklyTaskResult = TaskNotes & { code: string; score: number; practiced: number };
export type WeeklyReport = {
  week: string; dateRange: string; startDate?: string; endDate?: string; lessons: number;
  tasksCompleted: number; mockScore: number; attendance: number; note: string;
  taskResults?: WeeklyTaskResult[];
  excusedAbsences?: number | null; unexcusedAbsences?: number | null;
  homeworkStatus?: HomeworkStatus; examRecommendation?: ExamRecommendation;
  limitations?: string;
};
export type Student = {
  id: string; name: string; initials: string; email?: string; phone?: string;
  instructors: string[]; teachingAssistants: string[];
  instructorUsers?: AssignedUser[]; teachingAssistantUsers?: AssignedUser[];
  examRecommenders?: string[]; examRecommenderUsers?: AssignedUser[];
  phase: StudyPhase; startDate: string; examDate?: string; targetScore: number;
  currentScore: number; attendance: number; status: StudentStatus; color: string;
  passedRecordedDate?: string;
  tags?: StudentTag[];
  weeklyLimitations?: string;
  lastActive: string; skills: Record<PteSkill, number>; tasks: TaskProgress[];
  weeklyReports: WeeklyReport[];
};
