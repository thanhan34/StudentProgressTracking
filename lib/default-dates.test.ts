import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultWeekDates, toDateInput } from "./student-dates";

test("date input uses the local calendar at the start and end of a day", () => {
  assert.equal(toDateInput(new Date(2026, 8, 18, 0, 5)), "2026-09-18");
  assert.equal(toDateInput(new Date(2026, 8, 18, 23, 55)), "2026-09-18");
});

test("weekly dates start today and span seven calendar days", () => {
  const today = new Date(2026, 8, 18, 10);
  assert.deepEqual(defaultWeekDates(today), { startDate: "2026-09-18", endDate: "2026-09-24" });
  assert.equal(today.getDate(), 18);
});

test("weekly dates handle month and year boundaries", () => {
  assert.deepEqual(defaultWeekDates(new Date(2026, 11, 29)), { startDate: "2026-12-29", endDate: "2027-01-04" });
  assert.deepEqual(defaultWeekDates(new Date(2028, 1, 25)), { startDate: "2028-02-25", endDate: "2028-03-02" });
});