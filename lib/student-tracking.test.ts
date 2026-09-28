import assert from "node:assert/strict";
import { test } from "node:test";
import { applyWeeklyTask, parseAssignees, validAbsences, weeklyTrackingEntries } from "./student-tracking";
import type { TaskProgress, WeeklyReport } from "../data/students";

const task: TaskProgress = { code: "RA", name: "Read Aloud", skill: "Speaking", score: 50, target: 65, practiced: 100, assignees: ["An"], progressText: "Hiện tại", limitations: "Phát âm" };

const report: WeeklyReport = { week: "Tuần 1", dateRange: "", lessons: 0, tasksCompleted: 0, mockScore: 30, attendance: 100, note: "" };

test("empty and unrecorded weekly fields have no labels or placeholder values", () => {
  assert.deepEqual(weeklyTrackingEntries(report), []);
  assert.deepEqual(weeklyTrackingEntries({ ...report, excusedAbsences: null, unexcusedAbsences: null, homeworkStatus: "not_recorded", examRecommendation: "not_assessed", limitations: " \n " }), []);
});

test("explicit zero absences remain visible", () => {
  assert.deepEqual(weeklyTrackingEntries({ ...report, excusedAbsences: 0, unexcusedAbsences: 0 }), [
    { label: "Vắng có phép", value: "0 buổi" }, { label: "Vắng không phép", value: "0 buổi" },
  ]);
});

test("only populated weekly fields appear including negative assessments", () => {
  assert.deepEqual(weeklyTrackingEntries({ ...report, homeworkStatus: "not_assigned", examRecommendation: "not_yet", limitations: "Cần luyện thêm" }), [
    { label: "Bài tập về nhà", value: "Chưa giao bài" },
    { label: "Đánh giá thi", value: "Chưa khuyến khích thi" },
    { label: "Hạn chế trong tuần", value: "Cần luyện thêm" },
  ]);
});

test("multiple assignees are trimmed and deduplicated", () => {
  assert.deepEqual(parseAssignees(" An, Bình\nan, , "), ["an", "Bình"]);
  assert.deepEqual(parseAssignees(""), []);
});

test("absence counts allow unknown and nonnegative whole numbers only", () => {
  for (const value of [null, 0, 3, 14]) assert.equal(validAbsences(value), true);
  for (const value of [-1, 1.5, 15, NaN]) assert.equal(validAbsences(value), false);
});

test("latest report syncs text and assignees while adjusting practiced count", () => {
  const updated = applyWeeklyTask(task, { code: "RA", score: 60, practiced: 20, assignees: ["An", "Bình"], progressText: "Tiến bộ", limitations: "" }, 10, true);
  assert.equal(updated.practiced, 110);
  assert.equal(updated.progressText, "Tiến bộ");
  assert.equal(updated.limitations, "");
  assert.deepEqual(updated.assignees, ["An", "Bình"]);
});

test("editing historical report does not overwrite current notes or score", () => {
  const updated = applyWeeklyTask(task, { code: "RA", score: 30, practiced: 5, progressText: "Tuần cũ", assignees: [] }, 10, false);
  assert.equal(updated.practiced, 95);
  assert.equal(updated.progressText, task.progressText);
  assert.equal(updated.score, task.score);
  assert.deepEqual(updated.assignees, task.assignees);
});

test("legacy reports without notes preserve current notes", () => {
  assert.equal(applyWeeklyTask(task, { code: "RA", score: 60, practiced: 0 }, 0, true).progressText, task.progressText);
});