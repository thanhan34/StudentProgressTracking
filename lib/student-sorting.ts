import { normalizeStudentTags, type Student } from "../data/students";
import { daysUntilExam } from "./student-dates";

type ExamStudent = Pick<Student, "status" | "examDate" | "tags">;

export function sortStudentsByExam<T extends ExamStudent>(students: readonly T[], now = new Date()): T[] {
  return students.map((student) => ({ student, days: daysUntilExam(student.examDate, now) }))
    .sort((a, b) => {
      const dateGroup = (days: number | null) => days === null ? 2 : days < 0 ? 1 : 0;
      const groupOrder = dateGroup(a.days) - dateGroup(b.days);
      if (groupOrder) return groupOrder;
      if (a.days === null && b.days === null) {
        const hasExamPriority = (student: T) => normalizeStudentTags(student.tags).some((tag) => tag === "Có thể thi được" || tag === "Cần thi gấp");
        return Number(hasExamPriority(b.student)) - Number(hasExamPriority(a.student));
      }
      if (a.days === null || b.days === null) return 0;
      // Upcoming exams: earliest first. Past exams: most recent first.
      return a.days < 0 ? b.days - a.days : a.days - b.days;
    })
    .map(({ student }) => student);
}