import assert from "node:assert/strict";
import { test } from "node:test";
import type { Student } from "../data/students";
import { sortStudentsByExam } from "./student-sorting";

const now = new Date(2026, 8, 21, 15);
const student = (id: string, examDate?: string, status: Student["status"] = "Đang học") => ({ id, examDate, status });

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