import type { Student } from "../data/students";

export function buildExamCopyText(students: readonly Pick<Student, "name" | "examDate">[]): string {
  const groups = new Map<string, string[]>();
  for (const student of students) {
    const date = student.examDate;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) continue;
    const name = student.name.replace(/\s+/g, " ").trim();
    if (!name) continue;
    const names = groups.get(date) ?? [];
    names.push(name);
    groups.set(date, names);
  }
  if (!groups.size) return "";
  // Retain the table's date order; group by full date to avoid merging years.
  const lines = [...groups].map(([date, names]) => `${date.slice(8, 10)}/${date.slice(5, 7)} - ${names.join(", ")}`);
  return ["HỌC VIÊN THI", ...lines].join("\n");
}