import assert from "node:assert/strict";
import { test } from "node:test";
import { buildExamCopyText } from "./exam-copy";

test("groups matching dates and preserves table order and Vietnamese names", () => {
  const students = [
    { name: "Thủy", examDate: "2026-10-10" },
    { name: "Huy Hiếu", examDate: "2026-10-19" },
    { name: "Nguyễn Vi", examDate: "2026-10-10" },
  ];
  const original = structuredClone(students);
  assert.equal(buildExamCopyText(students), "HỌC VIÊN THI\n10/10 - Thủy, Nguyễn Vi\n19/10 - Huy Hiếu");
  assert.deepEqual(students, original);
});

test("excludes missing and invalid dates and empty names", () => {
  assert.equal(buildExamCopyText([
    { name: "An" }, { name: "Bình", examDate: "" },
    { name: "Chi", examDate: "2026-02-30" }, { name: "Dũng", examDate: "invalid" },
    { name: " ", examDate: "2026-10-10" },
  ]), "");
  assert.equal(buildExamCopyText([]), "");
});

test("keeps distinct students and years separate and normalizes whitespace", () => {
  assert.equal(buildExamCopyText([
    { name: " Nguyễn\nVi ", examDate: "2026-10-10" },
    { name: "Nguyễn Vi", examDate: "2026-10-10" },
    { name: "An", examDate: "2027-10-10" },
    { name: "Bình", examDate: "2024-02-29" },
  ]), "HỌC VIÊN THI\n10/10 - Nguyễn Vi, Nguyễn Vi\n10/10 - An\n29/02 - Bình");
});