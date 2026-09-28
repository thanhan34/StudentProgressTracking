import assert from "node:assert/strict";
import { test } from "node:test";
import type { Student } from "../data/students";
import { inlineStudentPatch } from "./student-inline";

const student = { startDate: "2026-01-01", tasks: [
  { code: "RA", name: "Read Aloud", skill: "Speaking", score: 30, target: 90, practiced: 0, progressText: "Existing" },
  { code: "RS", name: "Repeat Sentence", skill: "Speaking", score: 40, target: 90, practiced: 5 },
] } as Student;

test("exam date supports setting and clearing without modifying other fields", () => {
  assert.deepEqual(inlineStudentPatch(student, { kind: "examDate", value: "2026-10-01" }), { examDate: "2026-10-01" });
  assert.deepEqual(inlineStudentPatch(student, { kind: "examDate", value: "" }), { examDate: "" });
  for (const value of ["2025-12-31", "2026-02-30", "invalid"]) assert.throws(() => inlineStudentPatch(student, { kind: "examDate", value }));
});

test("weekly limitations support legacy profiles and preserve multiline text", () => {
  const value = "Cần luyện phát âm\nCần cải thiện tốc độ đọc";
  assert.deepEqual(inlineStudentPatch(student, { kind: "weeklyLimitations", value }), { weeklyLimitations: value });
  assert.equal(student.weeklyLimitations, undefined);
});

test("weekly limitations can be edited or cleared without changing reports or tasks", () => {
  const current = { ...student, weeklyLimitations: "Ghi chú cũ", weeklyReports: [{ week: "Tuần 1", limitations: "Lịch sử" }] } as Student;
  for (const value of ["Ghi chú mới", ""]) {
    const patch = inlineStudentPatch(current, { kind: "weeklyLimitations", value });
    assert.deepEqual(patch, { weeklyLimitations: value });
    const updated = { ...current, ...patch };
    assert.equal(updated.tasks, current.tasks);
    assert.equal(updated.weeklyReports, current.weeklyReports);
  }
  assert.equal(current.weeklyLimitations, "Ghi chú cũ");
});

test("staff assignment keeps names and account IDs together", () => {
  const users = [{ id: "user-1", name: "Teacher" }];
  assert.deepEqual(inlineStudentPatch(student, { kind: "instructors", names: ["Teacher"], users }), { instructors: ["Teacher"], instructorUsers: users });
  assert.deepEqual(inlineStudentPatch(student, { kind: "teachingAssistants", names: [], users: [] }), { teachingAssistants: [], teachingAssistantUsers: [] });
});

test("task patch preserves other tasks and fields and does not mutate input", () => {
  const patch = inlineStudentPatch(student, { kind: "task", code: "RA", patch: { score: 65 } });
  assert.equal(patch.tasks?.[0].score, 65);
  assert.equal(patch.tasks?.[0].progressText, "Existing");
  assert.deepEqual(patch.tasks?.[1], student.tasks[1]);
  assert.equal(student.tasks[0].score, 30);
  assert.deepEqual(Object.keys(patch), ["tasks"]);
});

test("invalid task values and missing tasks are rejected", () => {
  for (const patch of [{ score: 9 }, { target: 91 }, { practiced: -1 }, { practiced: 1.5 }, { score: NaN }]) {
    assert.throws(() => inlineStudentPatch(student, { kind: "task", code: "RA", patch }));
  }
  assert.throws(() => inlineStudentPatch(student, { kind: "task", code: "missing", patch: { score: 60 } }));
});

test("independent task changes compose without losing earlier progress", () => {
  const first = inlineStudentPatch(student, { kind: "task", code: "RA", patch: { progressText: "Updated" } });
  const second = inlineStudentPatch({ ...student, ...first }, { kind: "task", code: "RS", patch: { practiced: 20 } });
  assert.equal(second.tasks?.[0].progressText, "Updated");
  assert.equal(second.tasks?.[1].practiced, 20);
});