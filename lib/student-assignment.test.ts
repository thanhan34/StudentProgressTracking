import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesStudentAssignee } from "./student-assignment";
import type { TaskProgress } from "../data/students";

const user = { id: "user_1", name: "An" };
const task: TaskProgress = { code: "DI", name: "Describe Image", skill: "Speaking", score: 30, target: 65, practiced: 0 };

test("all filter includes students without assignments", () => {
  assert.equal(matchesStudentAssignee({ tasks: [] }, ""), true);
});

test("matches either profile assignment by account ID", () => {
  assert.equal(matchesStudentAssignee({ tasks: [], instructorUsers: [user] }, user.id), true);
  assert.equal(matchesStudentAssignee({ tasks: [], teachingAssistantUsers: [user] }, user.id), true);
  assert.equal(matchesStudentAssignee({ tasks: [], instructorUsers: [user] }, "other"), false);
});

test("includes current tasks with multiple assignees", () => {
  assert.equal(matchesStudentAssignee({ tasks: [{ ...task, assigneeUsers: [{ id: "other", name: "Bình" }, user] }] }, user.id), true);
});

test("does not infer account assignment from legacy names", () => {
  assert.equal(matchesStudentAssignee({ tasks: [{ ...task, assignees: [user.name] }] }, user.id), false);
  assert.equal(matchesStudentAssignee({ tasks: [], instructorUsers: [{ id: "other", name: user.name }] }, user.id), false);
});

test("historical weekly assignments do not count as current responsibility", () => {
  const student = { tasks: [], weeklyReports: [{ taskResults: [{ ...task, assigneeUsers: [user] }] }] };
  assert.equal(matchesStudentAssignee(student, user.id), false);
});