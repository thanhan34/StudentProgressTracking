import assert from "node:assert/strict";
import { test } from "node:test";
import type { Student } from "../data/students";
import { matchesStudentSearch, normalizeSearchText } from "./student-search";

const student: Pick<Student, "name" | "instructors" | "teachingAssistants" | "tasks"> = {
  name: "Bích Ngọc",
  instructors: ["Đặng Thảo"],
  teachingAssistants: ["Nguyễn Hữu Đức"],
  tasks: [{ code: "RS", name: "Repeat Sentence", skill: "Speaking", score: 40, target: 65, practiced: 10 }],
};

test("partial student names match with or without accents and case", () => {
  for (const query of ["bich", "BICH", "Bích", "ngoc", "bich ngoc", "BÍCH NGỌC", "ich ngo"]) {
    assert.ok(matchesStudentSearch(student, query), query);
  }
});

test("Vietnamese d with stroke and accented staff names remain searchable", () => {
  for (const query of ["dang", "ĐẶNG THẢO", "dang thao", "nguyen", "huu duc", "duc"]) {
    assert.ok(matchesStudentSearch(student, query), query);
  }
  assert.ok(matchesStudentSearch({ ...student, name: "Đỗ Đăng", instructors: [], teachingAssistants: [] }, "do dang"));
});

test("precomposed and decomposed Unicode produce the same matches", () => {
  assert.ok(matchesStudentSearch(student, "Bích".normalize("NFD")));
  assert.ok(matchesStudentSearch({ ...student, name: student.name.normalize("NFD") }, "bich ngoc"));
  assert.equal(normalizeSearchText("ĐỖ ĐĂNG Á Ắ Ấ É Ế Í Ó Ố Ớ Ú Ứ Ý"), "do dang a a a e e i o o o u u y");
});

test("extra whitespace is ignored and blank queries match all students", () => {
  for (const query of ["", "   ", "\t\n", "  bich   ngoc  "]) {
    assert.ok(matchesStudentSearch(student, query), query);
  }
  assert.ok(matchesStudentSearch({ ...student, name: "Bích   Ngọc" }, "bich ngoc"));
});

test("task code search is preserved and unrelated queries do not match", () => {
  assert.ok(matchesStudentSearch(student, "rs"));
  assert.ok(matchesStudentSearch(student, "RS"));
  assert.equal(matchesStudentSearch(student, "Minh Anh"), false);
  assert.equal(matchesStudentSearch(student, "WFD"), false);
});

test("search does not change stored names or support team data", () => {
  const original = structuredClone(student);
  matchesStudentSearch(student, "bich");
  assert.deepEqual(student, original);
});