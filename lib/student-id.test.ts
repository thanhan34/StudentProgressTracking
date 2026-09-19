import assert from "node:assert/strict";
import { test } from "node:test";
import { generateStudentId } from "./student-id";

test("student IDs have a PTE prefix and full UUID without document path separators", () => {
  assert.match(generateStudentId(), /^PTE-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);
});

test("independent form openings generate distinct student IDs", () => {
  const ids = Array.from({ length: 1000 }, () => generateStudentId());
  assert.equal(new Set(ids).size, ids.length);
});