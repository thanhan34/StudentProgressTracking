import type { Student } from "../data/students";
import type { StaffOption } from "./staff";
import { getHonoredStudents, getHonoredSupporters } from "./honors";
import { toDateInput } from "./student-dates";

export function isValidRecordedDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && toDateInput(date) === value;
}

export function withPassedRecordedDate(next: Student, previous?: Student, today = toDateInput()): Student {
  if (next.status !== "Đã thi đậu") return { ...next, passedRecordedDate: "" };
  if (previous?.status !== "Đã thi đậu") return { ...next, passedRecordedDate: today };
  if (isValidRecordedDate(previous.passedRecordedDate)) return { ...next, passedRecordedDate: previous.passedRecordedDate };
  return { ...next, passedRecordedDate: next.passedRecordedDate ?? "" };
}

export type InstructorRanking = { key: string; name: string; students: Student[]; count: number; rank: number };

export function getInstructorRanking(students: Student[], staff: StaffOption[], year: string, month?: string): InstructorRanking[] {
  if (!/^\d{4}$/.test(year) || (month !== undefined && !/^(0[1-9]|1[0-2])$/.test(month))) return [];
  const prefix = month ? `${year}-${month}` : year;
  const people = new Map<string, { name: string; students: Map<string, Student> }>();
  for (const student of getHonoredStudents(students)) {
    if (!isValidRecordedDate(student.passedRecordedDate) || !student.passedRecordedDate.startsWith(prefix)) continue;
    for (const person of getHonoredSupporters(student, staff).filter((person) => person.roles.includes("Giảng viên"))) {
      const entry = people.get(person.key) ?? { name: person.name, students: new Map<string, Student>() };
      entry.students.set(student.id, student);
      people.set(person.key, entry);
    }
  }
  const entries = [...people].map(([key, entry]) => ({ key, name: entry.name, students: [...entry.students.values()], count: entry.students.size, rank: 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "vi") || a.key.localeCompare(b.key));
  for (let index = 0; index < entries.length; index++) {
    entries[index].rank = index > 0 && entries[index].count === entries[index - 1].count ? entries[index - 1].rank : index + 1;
  }
  return entries;
}