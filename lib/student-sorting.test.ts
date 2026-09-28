import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_TAGS, type Student } from "../data/students";
import { sortStudentsByExam } from "./student-sorting";

const now = new Date(2026, 8, 21, 15);
const student = (id: string, examDate?: string, status: Student["status"] = "Đang học") => ({ id, examDate, status });

test("each supported tag prioritizes students above untagged booked students", () => {
  for (const tag of STUDENT_TAGS) {
    const students = [student("booked", "2026-09-21", "Đã đăng ký thi"), { ...student("tagged"), tags: [tag] }];
    assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["tagged", "booked"]);
  }
});

test("tagged groups preserve booking and exam ordering without ranking tags or counting them", () => {
  const students = [
    { ...student("tagged-far", "2026-10-01"), tags: [...STUDENT_TAGS] },
    student("untagged", "2026-09-21", "Đã đăng ký thi"),
    { ...student("tagged-near", "2026-09-22"), tags: [STUDENT_TAGS[0]] },
    { ...student("tagged-booked", undefined, "Đã đăng ký thi"), tags: [STUDENT_TAGS[2]] },
  ];
  const original = [...students];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["tagged-booked", "tagged-near", "tagged-far", "untagged"]);
  assert.deepEqual(students, original);
});

test("empty tags behave like legacy profiles without tags", () => {
  const students = [{ ...student("empty"), tags: [] }, student("legacy")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["empty", "legacy"]);
});

test("booked students come first, then upcoming dates ascending within each group", () => {
  const students = [student("near", "2026-09-22"), student("booked-far", "2026-10-10", "Đã đăng ký thi"),
    student("far", "2026-10-01"), student("booked-near", "2026-09-23", "Đã đăng ký thi")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["booked-near", "booked-far", "near", "far"]);
});

test("today and future exams precede past exams and missing or invalid dates", () => {
  const students = [student("missing"), student("old", "2026-08-01"), student("future", "2026-09-22"),
    student("invalid", "invalid"), student("recent", "2026-09-20"), student("today", "2026-09-21"), student("empty", "")];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["today", "future", "recent", "old", "missing", "invalid", "empty"]);
});

test("booking priority also applies without an exam date", () => {
  assert.deepEqual(sortStudentsByExam([student("today", "2026-09-21"), student("booked", undefined, "Đã đăng ký thi")], now)
    .map((s) => s.id), ["booked", "today"]);
});

test("ties retain their original order and sorting does not mutate the input", () => {
  const students = [student("far", "2026-10-01"), student("a", "2026-09-22"), student("b", "2026-09-22")];
  const original = [...students];
  assert.deepEqual(sortStudentsByExam(students, now).map((s) => s.id), ["a", "b", "far"]);
  assert.deepEqual(students, original);
  assert.deepEqual(sortStudentsByExam([], now), []);
});