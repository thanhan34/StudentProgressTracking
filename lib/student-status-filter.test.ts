import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_STATUSES, type StudentStatus } from "../data/students";
import { DEFAULT_STUDENT_STATUSES, matchesStudentStatus, toggleStudentStatus } from "./student-status-filter";

test("default filter excludes passed, reserved and dropped-out students", () => {
  assert.deepEqual(STUDENT_STATUSES.filter((status) => matchesStudentStatus(status, DEFAULT_STUDENT_STATUSES)), ["Đã đăng ký thi", "Đang học"]);
});

test("multiple statuses match independently", () => {
  const selected: StudentStatus[] = ["Đã thi đậu", "Bảo Lưu", "Bỏ học"];
  assert.deepEqual(STUDENT_STATUSES.filter((status) => matchesStudentStatus(status, selected)), selected);
});

test("all statuses and empty selection have explicit behavior", () => {
  assert.ok(STUDENT_STATUSES.every((status) => matchesStudentStatus(status, STUDENT_STATUSES)));
  assert.ok(STUDENT_STATUSES.every((status) => !matchesStudentStatus(status, [])));
});

test("toggling adds and removes a status without changing other selections or defaults", () => {
  const selected = [...DEFAULT_STUDENT_STATUSES];
  const added = toggleStudentStatus(selected, "Bảo Lưu");
  assert.deepEqual(added, [...selected, "Bảo Lưu"]);
  assert.deepEqual(toggleStudentStatus(added, "Bảo Lưu"), selected);
  assert.deepEqual(selected, ["Đã đăng ký thi", "Đang học"]);
  assert.deepEqual(toggleStudentStatus(["Bảo Lưu"], "Bảo Lưu"), []);
});