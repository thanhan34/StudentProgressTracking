import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_STATUSES, normalizeStudentStatus } from "../data/students";

test("student status options match the requested labels and order", () => {
  assert.deepEqual(STUDENT_STATUSES, ["Đã đăng ký thi", "Đã thi đậu", "Đang học", "Bảo Lưu", "Bỏ học"]);
});

test("all supported student statuses are preserved", () => {
  for (const status of STUDENT_STATUSES) {
    assert.equal(normalizeStudentStatus(status), status);
  }
});

test("legacy and invalid statuses default to studying without inferring exam registration", () => {
  for (const status of ["Đúng tiến độ", "Cần chú ý", "Sắp thi", "", "unknown", undefined, null, 1]) {
    assert.equal(normalizeStudentStatus(status), "Đang học");
  }
});