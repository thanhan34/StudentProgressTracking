import assert from "node:assert/strict";
import { test } from "node:test";
import { isAssignableRole, legacyAssignmentNames } from "./staff";
import { applyWeeklyTask } from "./student-tracking";
import type { TaskProgress } from "../data/students";

test("only teaching assistants and reserves are selectable", () => {
  for (const role of ["teaching_assistant", "reserve_teaching_assistant"] as const) assert.equal(isAssignableRole(role), true);
  for (const role of ["pending", "admin", "admin_assistant"] as const) assert.equal(isAssignableRole(role), false);
});

test("legacy names are preserved without automatically linking accounts", () => {
  assert.deepEqual(legacyAssignmentNames(["An", "Bình"], []), ["An", "Bình"]);
  assert.deepEqual(legacyAssignmentNames(["An", "An", "Bình"], [{ id: "1", name: "An" }]), ["An", "Bình"]);
  assert.deepEqual(legacyAssignmentNames(["An", "An"], [{ id: "1", name: "An" }, { id: "2", name: "An" }]), []);
});

const task: TaskProgress = { code: "DI", name: "Describe Image", skill: "Speaking", score: 50, target: 65, practiced: 0, assignees: ["An"], assigneeUsers: [{ id: "1", name: "An" }] };

test("latest weekly assignments sync account IDs and support clearing", () => {
  const result = { code: "DI", score: 60, practiced: 2, assignees: ["Bình"], assigneeUsers: [{ id: "2", name: "Bình" }] };
  assert.deepEqual(applyWeeklyTask(task, result, 0, true).assigneeUsers, result.assigneeUsers);
  assert.deepEqual(applyWeeklyTask(task, { ...result, assignees: [], assigneeUsers: [] }, 0, true).assigneeUsers, []);
});

test("historical edits preserve current IDs and legacy names never inherit unrelated IDs", () => {
  const result = { code: "DI", score: 60, practiced: 0, assignees: ["Bình"] };
  assert.deepEqual(applyWeeklyTask(task, result, 0, false).assigneeUsers, task.assigneeUsers);
  assert.deepEqual(applyWeeklyTask(task, result, 0, true).assigneeUsers, []);
  assert.deepEqual(applyWeeklyTask(task, { code: "DI", score: 60, practiced: 0 }, 0, true).assigneeUsers, task.assigneeUsers);
});