import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_TAGS, normalizeStudentTags } from "../data/students";

test("student tags match the requested labels", () => {
  assert.deepEqual(STUDENT_TAGS, ["Có thể thi được", "Cần thi gấp", "Cần hỗ trợ đặc biệt"]);
});

test("legacy and malformed tag values default to an empty selection", () => {
  for (const value of [undefined, null, "Cần thi gấp", {}, 1, []]) {
    assert.deepEqual(normalizeStudentTags(value), []);
  }
});

test("multiple tags are preserved in stable order without duplicates or unknown values", () => {
  const input = [STUDENT_TAGS[2], STUDENT_TAGS[0], STUDENT_TAGS[0], "unknown", null];
  assert.deepEqual(normalizeStudentTags(input), [STUDENT_TAGS[0], STUDENT_TAGS[2]]);
  assert.equal(input.length, 5);
  assert.deepEqual(normalizeStudentTags([...STUDENT_TAGS]), [...STUDENT_TAGS]);
});

test("removing one or all tags does not restore removed tags", () => {
  assert.deepEqual(normalizeStudentTags(STUDENT_TAGS.filter((tag) => tag !== "Cần thi gấp")), [STUDENT_TAGS[0], STUDENT_TAGS[2]]);
  assert.deepEqual(normalizeStudentTags([]), []);
});