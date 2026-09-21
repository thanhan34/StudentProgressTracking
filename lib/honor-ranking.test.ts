import assert from "node:assert/strict";
import { test } from "node:test";
import type { Student } from "../data/students";
import { getInstructorRanking, isValidRecordedDate, withPassedRecordedDate } from "./honor-ranking";

const student: Student = {
  id: "1", name: "Học viên", initials: "HV", instructors: ["An"], teachingAssistants: [],
  phase: "Nước rút", startDate: "2026-01-01", targetScore: 65, currentScore: 60,
  attendance: 100, status: "Đã thi đậu", color: "#fff", lastActive: "", tasks: [], weeklyReports: [],
  skills: { Speaking: 60, Writing: 60, Reading: 60, Listening: 60 }, passedRecordedDate: "2026-09-21",
};

test("records transitions, preserves existing dates and clears when leaving passed status", () => {
  assert.equal(withPassedRecordedDate(student, undefined, "2026-09-22").passedRecordedDate, "2026-09-22");
  assert.equal(withPassedRecordedDate({ ...student, passedRecordedDate: "2026-09-22" }, student).passedRecordedDate, "2026-09-21");
  assert.equal(withPassedRecordedDate({ ...student, status: "Đang học" }, student).passedRecordedDate, "");
  assert.equal(withPassedRecordedDate(student, { ...student, status: "Đang học" }, "2026-10-01").passedRecordedDate, "2026-10-01");
});

test("legacy records are not automatically assigned today's date and support backfill", () => {
  const legacy = { ...student, passedRecordedDate: undefined };
  assert.equal(withPassedRecordedDate(legacy, legacy).passedRecordedDate, "");
  assert.equal(withPassedRecordedDate(student, legacy).passedRecordedDate, "2026-09-21");
});

test("validates real calendar dates", () => {
  for (const date of [undefined, "", "2026-02-30", "2026-13-01", "2026-9-1"]) assert.equal(isValidRecordedDate(date), false);
  assert.equal(isValidRecordedDate("2024-02-29"), true);
});

test("month and year rankings exclude missing dates, other years and non-passed students", () => {
  const students = [student, { ...student, id: "2", passedRecordedDate: "2026-10-01" },
    { ...student, id: "3", passedRecordedDate: "2025-09-21" }, { ...student, id: "4", passedRecordedDate: undefined },
    { ...student, id: "5", status: "Đang học" as const }];
  assert.equal(getInstructorRanking(students, [], "2026", "09")[0].count, 1);
  assert.equal(getInstructorRanking(students, [], "2026")[0].count, 2);
  assert.deepEqual(getInstructorRanking(students, [], "2027"), []);
  assert.deepEqual(getInstructorRanking(students, [], "2026", "13"), []);
});

test("credits multiple instructors once per student, preserves distinct IDs and competition ties", () => {
  const shared = { ...student, instructors: ["An", "An", "Bình"], instructorUsers: [{ id: "a", name: "An" }, { id: "b", name: "An" }, { id: "c", name: "Bình" }] };
  const other = { ...student, id: "2", instructors: ["An", "An"], instructorUsers: [{ id: "a", name: "An" }, { id: "b", name: "An" }] };
  const ranking = getInstructorRanking([shared, shared, other], [], "2026");
  assert.deepEqual(ranking.map((person) => person.count), [2, 2, 1]);
  assert.deepEqual(ranking.map((person) => person.rank), [1, 1, 3]);
  assert.equal(new Set(ranking.map((person) => person.key)).size, 3);
});