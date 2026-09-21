import assert from "node:assert/strict";
import { test } from "node:test";
import { getHonoredStudents, getHonoredSupporters } from "./honors";
import type { Student } from "../data/students";

const student: Student = {
  id: "1", name: "Học viên", initials: "HV", instructors: ["Cô An"], teachingAssistants: [],
  phase: "Nước rút", startDate: "2026-01-01", targetScore: 65, currentScore: 60,
  attendance: 100, status: "Đã thi đậu", color: "#fff", lastActive: "", tasks: [], weeklyReports: [],
  skills: { Speaking: 60, Writing: 60, Reading: 60, Listening: 60 },
};

test("honors uses passed status, not current score", () => {
  assert.deepEqual(getHonoredStudents([student, { ...student, id: "2", status: "Đang học", currentScore: 90 }]), [student]);
});

test("collects historical supporters and distinguishes reserve assistants", () => {
  const user = { id: "reserve", name: "Bình" };
  const result = getHonoredSupporters({ ...student, teachingAssistants: ["Bình"], teachingAssistantUsers: [user],
    weeklyReports: [{ week: "1", dateRange: "", lessons: 1, tasksCompleted: 1, mockScore: 60, attendance: 100, note: "",
      taskResults: [{ code: "RA", score: 60, practiced: 1, assignees: ["Bình", "Người cũ"], assigneeUsers: [user] }] }],
  }, [{ ...user, role: "reserve_teaching_assistant" }]);
  assert.equal(result.length, 3);
  assert.deepEqual(result.find((person) => person.key === "user:reserve")?.roles, ["Trợ giảng dự bị"]);
  assert.ok(result.some((person) => person.name === "Người cũ"));
  assert.deepEqual(result[0].roles, ["Giảng viên"]);
});

test("same-name accounts remain distinct and missing staff is retained", () => {
  const result = getHonoredSupporters({ ...student, instructors: [], teachingAssistants: ["An", "An"],
    teachingAssistantUsers: [{ id: "a", name: "An" }, { id: "b", name: "An" }],
  }, []);
  assert.equal(result.length, 2);
  assert.ok(result.every((person) => person.roles.includes("Trợ giảng (chưa xác định loại)")));
});

test("current task supporters are included and empty data is supported", () => {
  assert.deepEqual(getHonoredSupporters({ ...student, instructors: [] }, []), []);
  const result = getHonoredSupporters({ ...student, tasks: [{ code: "RA", name: "Read Aloud", skill: "Speaking", score: 60, target: 65, practiced: 1,
    assignees: ["Lan"], assigneeUsers: [{ id: "ta", name: "Lan" }] }] }, [{ id: "ta", name: "Lan", role: "teaching_assistant" }]);
  assert.deepEqual(result[1].roles, ["Trợ giảng"]);
});