import type { AssignedUser } from "../lib/staff";

export type StudentStatus = "Đúng tiến độ" | "Cần chú ý" | "Sắp thi";
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
  phase: StudyPhase; startDate: string; examDate?: string; targetScore: number;
  currentScore: number; attendance: number; status: StudentStatus; color: string;
  lastActive: string; skills: Record<PteSkill, number>; tasks: TaskProgress[];
  weeklyReports: WeeklyReport[];
};
