import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultAssigneeFilter } from "./default-assignee-filter";

test("administrator sees all students by default", () => {
  assert.equal(defaultAssigneeFilter("admin", "admin_1"), "");
});

test("other approved roles see their assignments by default", () => {
  for (const role of ["admin_assistant", "teaching_assistant", "reserve_teaching_assistant"] as const) {
    assert.equal(defaultAssigneeFilter(role, "user_1"), "user_1");
  }
});