import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_TAGS, type Student } from "../data/students";
import { sortStudentsByExam } from "./student-sorting";

const now = new Date(2026, 8, 21, 15);
const student = (id: string, examDate?: string, status: Student["status"] = "Đang học") => ({ id, examDate, status });

test("tags do not prioritize undated students above dated students", () => {
  for (const tag of STUDENT_TAGS) {
    const students = [student("booked", "2026-09-21", "Đã đăng ký thi"), { ...student("tagged"), tags: [tag] }];
    assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["booked", "tagged"]);
  }
});

test("dates determine ordering regardless of tags or booking status", () => {
  const students = [
    { ...student("tagged-far", "2026-10-01"), tags: [...STUDENT_TAGS] },
    student("untagged", "2026-09-21", "Đã đăng ký thi"),
    { ...student("tagged-near", "2026-09-22"), tags: [STUDENT_TAGS[0]] },
    { ...student("tagged-booked", undefined, "Đã đăng ký thi"), tags: [STUDENT_TAGS[2]] },
  ];
  const original = [...students];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["untagged", "tagged-near", "tagged-far", "tagged-booked"]);
  assert.deepEqual(students, original);
});

test("empty tags behave like legacy profiles without tags", () => {
  const students = [{ ...student("empty"), tags: [] }, student("legacy")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["empty", "legacy"]);
});

test("undated students with ready or urgent tags precede other undated students equally", () => {
  const students: Pick<Student, "id" | "examDate" | "status" | "tags">[] = [
    student("ordinary"),
    { ...student("special"), tags: ["Cần hỗ trợ đặc biệt"] },
    { ...student("ready"), tags: ["Có thể thi được"] },
    { ...student("urgent", ""), tags: ["Cần thi gấp"] },
    { ...student("both", "invalid"), tags: ["Có thể thi được", "Cần thi gấp"] },
    student("booked", undefined, "Đã đăng ký thi"),
    student("past", "2026-09-20"),
    student("future", "2026-10-01"),
  ];
  const original = [...students];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["future", "past", "ready", "urgent", "both", "ordinary", "special", "booked"]);
  assert.deepEqual(students, original);
});

test("upcoming dates sort nearest first across all statuses", () => {
  const students = [student("near", "2026-09-22"), student("booked-far", "2026-10-10", "Đã đăng ký thi"),
    student("far", "2026-10-01"), student("booked-near", "2026-09-23", "Đã đăng ký thi")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["near", "booked-near", "far", "booked-far"]);
});

test("today and future exams precede past exams and missing or invalid dates", () => {
  const students = [student("missing"), student("old", "2026-08-01"), student("future", "2026-09-22"),
    student("invalid", "invalid"), student("recent", "2026-09-20"), student("today", "2026-09-21"), student("empty", "")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["today", "future", "recent", "old", "missing", "invalid", "empty"]);
});

test("booked students without a date remain after students with a date", () => {
  assert.deepEqual(sortStudentsByExam([student("today", "2026-09-21"), student("booked", undefined, "Đã đăng ký thi")], now)
    .map((s) => s.id), ["today", "booked"]);
});

test("ties retain their original order and sorting does not mutate the input", () => {
  const students = [student("far", "2026-10-01"), student("a", "2026-09-22"), student("b", "2026-09-22")];
  const original = [...students];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["a", "b", "far"]);
  assert.deepEqual(students, original);
  assert.deepEqual(sortStudentsByExam([], now), []);
});