import type { Student } from "../data/students";

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesStudentSearch(
  student: Pick<Student, "name" | "instructors" | "teachingAssistants" | "tasks">,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const searchable = `${student.name} ${student.instructors.join(" ")} ${student.teachingAssistants.join(" ")} ${student.tasks.map((task) => task.code).join(" ")}`;
  return normalizeSearchText(searchable).includes(normalizedQuery);
}