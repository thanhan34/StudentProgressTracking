import type { Student } from "../data/students";
import { legacyAssignmentNames, type AssignedUser, type StaffOption } from "./staff";

export type HonoredSupporter = { key: string; name: string; roles: string[] };

export function getHonoredSupporters(student: Student, staff: StaffOption[]): HonoredSupporter[] {
  const people = new Map<string, HonoredSupporter>();
  const directory = new Map(staff.map((person) => [person.id, person]));
  const add = (key: string, name: string, role: string) => {
    if (!name.trim()) return;
    const existing = people.get(key);
    if (existing) {
      if (!existing.roles.includes(role)) existing.roles.push(role);
    } else people.set(key, { key, name: name.trim(), roles: [role] });
  };
  const collect = (names: string[], users: AssignedUser[], fallback: string) => {
    for (const user of users) {
      const person = directory.get(user.id);
      const role = fallback === "Giảng viên" ? fallback
        : person?.role === "reserve_teaching_assistant" ? "Trợ giảng dự bị"
        : person?.role === "teaching_assistant" ? "Trợ giảng" : fallback;
      add(`user:${user.id}`, person?.name || user.name, role);
    }
    for (const name of legacyAssignmentNames(names, users)) {
      add(`legacy:${name.trim().toLocaleLowerCase("vi")}`, name, fallback);
    }
  };
  collect(student.instructors, student.instructorUsers ?? [], "Giảng viên");
  collect(student.teachingAssistants, student.teachingAssistantUsers ?? [], "Trợ giảng (chưa xác định loại)");
  for (const task of [...student.tasks, ...student.weeklyReports.flatMap((report) => report.taskResults ?? [])]) {
    collect(task.assignees ?? [], task.assigneeUsers ?? [], "Người hỗ trợ (chưa xác định vai trò)");
  }
  return [...people.values()];
}

export function getHonoredStudents(students: Student[]): Student[] {
  return students.filter((student) => student.status === "Đã thi đậu");
}