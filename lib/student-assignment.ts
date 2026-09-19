import type { Student } from "../data/students";

type StudentAssignments = Pick<Student, "instructorUsers" | "teachingAssistantUsers" | "tasks">;

// Match current account IDs, never legacy names or historical assignments.
export function matchesStudentAssignee(student: StudentAssignments, userId: string): boolean {
  if (!userId) return true;
  return Boolean(student.instructorUsers?.some((user) => user.id === userId)
    || student.teachingAssistantUsers?.some((user) => user.id === userId)
    || student.tasks.some((task) => task.assigneeUsers?.some((user) => user.id === userId)));
}