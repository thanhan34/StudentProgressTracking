import type { StudentStatus } from "../data/students";

export const DEFAULT_STUDENT_STATUSES: StudentStatus[] = ["Đã đăng ký thi", "Đang học"];

export function matchesStudentStatus(status: StudentStatus, selected: readonly StudentStatus[]) {
  return selected.includes(status);
}

export function toggleStudentStatus(selected: readonly StudentStatus[], status: StudentStatus): StudentStatus[] {
  return selected.includes(status) ? selected.filter((item) => item !== status) : [...selected, status];
}