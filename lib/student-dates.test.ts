import assert from "node:assert/strict";
import { test } from "node:test";
import { daysUntilExam, formatStudentDate, isUpcomingExam, examCountdown } from "./student-dates";

test("missing, empty and invalid dates are excluded from upcoming exams", () => {
  for (const date of [undefined, "", "invalid"]) {
    assert.equal(daysUntilExam(date), null);
    assert.equal(isUpcomingExam(date), false);
    assert.equal(examCountdown(date), "Chưa có lịch thi");
  }
  assert.equal(formatStudentDate(""), "Chưa có lịch thi");
  assert.equal(formatStudentDate(undefined), "Chưa có lịch thi");
});

test("upcoming exams include today and day 30, excluding past and day 31", () => {
  const now = new Date(2026, 8, 19, 12);
  assert.equal(daysUntilExam("2026-09-19", now), 0);
  assert.equal(isUpcomingExam("2026-09-19", now), true);
  assert.equal(isUpcomingExam("2026-10-19", now), true);
  assert.equal(isUpcomingExam("2026-10-20", now), false);
  assert.equal(isUpcomingExam("2026-09-18", now), false);
  assert.equal(formatStudentDate("2026-09-19"), "19/09/2026");
});