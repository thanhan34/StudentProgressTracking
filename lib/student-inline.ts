import { STUDENT_STATUSES, type Student, type StudentStatus, type TaskProgress } from "../data/students";
import { withPassedRecordedDate } from "./honor-ranking";

export type TaskInlinePatch = Partial<Pick<TaskProgress, "score" | "target" | "practiced" | "assignees" | "assigneeUsers" | "progressText" | "limitations">>;
export type StudentInlineChange =
  | { kind: "status"; value: StudentStatus }
  | { kind: "examRecommenders"; names: string[]; users: NonNullable<Student["examRecommenderUsers"]> }
  | { kind: "examDate"; value: string }
  | { kind: "weeklyLimitations"; value: string }
  | { kind: "instructors" | "teachingAssistants"; names: string[]; users: NonNullable<Student["instructorUsers"]> }
  | { kind: "task"; code: string; patch: TaskInlinePatch };

export function inlineStudentPatch(student: Student, change: StudentInlineChange): Partial<Student> {
  if (change.kind === "examRecommenders") return { examRecommenders: change.names, examRecommenderUsers: change.users };
  if (change.kind === "status") {
    if (!STUDENT_STATUSES.includes(change.value)) throw new Error("Trạng thái học viên không hợp lệ.");
    const updated = withPassedRecordedDate({ ...student, status: change.value }, student);
    return { status: updated.status, passedRecordedDate: updated.passedRecordedDate ?? "" };
  }
  if (change.kind === "weeklyLimitations") return { weeklyLimitations: change.value };
  if (change.kind === "examDate") {
    const value = change.value;
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) {
      throw new Error("Ngày đăng ký thi không hợp lệ.");
    }
    if (value && student.startDate && value < student.startDate) throw new Error("Ngày đăng ký thi không được trước ngày bắt đầu học.");
    if (!value) return { examDate: "" };
    const updated = withPassedRecordedDate({ ...student, examDate: value, status: "Đã đăng ký thi" }, student);
    return { examDate: value, status: updated.status, passedRecordedDate: updated.passedRecordedDate ?? "" };
  }
  if (change.kind === "instructors") return { instructors: change.names, instructorUsers: change.users };
  if (change.kind === "teachingAssistants") return { teachingAssistants: change.names, teachingAssistantUsers: change.users };
  if (change.kind !== "task") throw new Error("Thay đổi không hợp lệ.");
  if (!student.tasks.some((task) => task.code === change.code)) throw new Error("Task không còn tồn tại. Vui lòng tải lại hồ sơ.");
  for (const field of ["score", "target", "practiced"] as const) {
    const value = change.patch[field];
    if (value === undefined) continue;
    const min = field === "practiced" ? 0 : 10;
    const max = field === "practiced" ? 99999 : 90;
    if (!Number.isFinite(value) || value < min || value > max || (field === "practiced" && !Number.isInteger(value))) {
      throw new Error(field === "practiced" ? "Số câu đã luyện phải là số nguyên từ 0 đến 99999." : "Điểm phải nằm trong khoảng 10–90.");
    }
  }
  return { tasks: student.tasks.map((task) => task.code === change.code ? { ...task, ...change.patch } : task) };
}