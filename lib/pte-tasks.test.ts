import assert from "node:assert/strict";
import { test } from "node:test";
import { addMissingDefaultTasks, createDefaultTasks, pteTaskTemplates } from "./pte-tasks";

const skills = { Speaking: 40, Writing: 45, Reading: 50, Listening: 55 };

test("new tasks default to 90 while existing targets are preserved", () => {
  assert.ok(createDefaultTasks(skills).every((task) => task.target === 90));
  const existing = createDefaultTasks(skills, 65).slice(0, 1);
  const updated = addMissingDefaultTasks(existing, skills);
  assert.equal(updated[0].target, 65);
  assert.ok(updated.slice(1).every((task) => task.target === 90));
});

test("catalog contains 22 distinct question types across four skills", () => {
  assert.equal(pteTaskTemplates.length, 22);
  assert.equal(new Set(pteTaskTemplates.map((task) => task.code)).size, 22);
  for (const [skill, count] of Object.entries({ Speaking: 7, Writing: 2, Reading: 5, Listening: 8 })) {
    assert.equal(pteTaskTemplates.filter((task) => task.skill === skill).length, count);
  }
});

test("defaults follow requested order and student scores", () => {
  const tasks = createDefaultTasks(skills, 79);
  assert.deepEqual(tasks.map((task) => task.code), ["DI", "RL", "SGD", "SWT", "HIW", "WFD"]);
  for (const task of tasks) {
    assert.equal(task.score, skills[task.skill]);
    assert.equal(task.target, 79);
    assert.equal(task.practiced, 0);
  }
});

test("adding missing defaults preserves existing progress and is idempotent", () => {
  const existing = [{ ...createDefaultTasks(skills, 65)[0], score: 70, practiced: 120, progressText: "Tiến bộ", assignees: ["An"] }];
  const updated = addMissingDefaultTasks(existing, skills, 65);
  assert.equal(updated.length, 6);
  assert.equal(updated[0], existing[0]);
  assert.equal(existing.length, 1);
  assert.deepEqual(addMissingDefaultTasks(updated, skills, 65), updated);
});

test("default task instances do not share mutable state", () => {
  const first = createDefaultTasks(skills, 65);
  first[0].score = 90;
  assert.equal(createDefaultTasks(skills, 65)[0].score, 40);
});