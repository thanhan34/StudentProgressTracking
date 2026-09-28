"use client";

import type { Student, TaskProgress } from "@/data/students";
import type { StudentInlineChange, TaskInlinePatch } from "@/lib/student-inline";
import AutoSaveField from "@/components/ui/auto-save-field";
import StaffSelect from "@/components/staff-select";

export type InlineSave = (change: StudentInlineChange) => Promise<void>;

export function InlineWeeklyLimitations({ student, onSave }: { student: Student; onSave: InlineSave }) {
  return <div className="student-weekly-limitations">
    <AutoSaveField initialValue={student.weeklyLimitations ?? ""} onSave={(value) => onSave({ kind: "weeklyLimitations", value })}>
      {(value, change, commit) => <label className="form-field">
        <span>Hạn chế của học viên trong tuần</span>
        <textarea rows={4} value={value} placeholder="Nhập những hạn chế học viên cần cải thiện trong tuần…" onChange={(event) => change(event.target.value)} onBlur={() => commit()} />
        <small>Tự lưu khi rời ô. Ghi chú này không thay đổi các báo cáo tuần đã lưu.</small>
      </label>}
    </AutoSaveField>
  </div>;
}

export function InlineExamDate({ student, onSave }: { student: Student; onSave: InlineSave }) {
  return <AutoSaveField initialValue={student.examDate ?? ""} onSave={(value) => onSave({ kind: "examDate", value })}>
    {(value, change, commit) => <label className="form-field"><span>Thi dự kiến</span><input type="date" min={student.startDate || undefined} value={value} onChange={(event) => change(event.target.value)} onBlur={() => commit()} /><small>Để trống nếu chưa có lịch thi. Tự lưu khi rời ô.</small></label>}
  </AutoSaveField>;
}

export function InlineSupportTeam({ student, onSave }: { student: Student; onSave: InlineSave }) {
  return <section className="detail-section"><div className="section-heading"><h3>Đội ngũ hỗ trợ</h3></div><div className="inline-support-grid">
    {(["instructors", "teachingAssistants"] as const).map((kind) => <AutoSaveField key={kind} initialValue={{ names: student[kind], users: (kind === "instructors" ? student.instructorUsers : student.teachingAssistantUsers) ?? [] }} onSave={({ names, users }) => onSave({ kind, names, users })}>
      {(value, _change, commit) => <StaffSelect label={kind === "instructors" ? "Giảng viên phụ trách" : "Trợ giảng hỗ trợ"} names={value.names} selectedUsers={value.users} onChange={(names, users) => commit({ names, users })} />}
    </AutoSaveField>)}
  </div></section>;
}

export function InlineTaskProgress({ task, onSave }: { task: TaskProgress; onSave: InlineSave }) {
  const save = (patch: TaskInlinePatch) => onSave({ kind: "task", code: task.code, patch });
  return <article className="inline-task-card">
    <header><span className="task-code">{task.code}</span><div><strong>{task.name}</strong><small>{task.skill}</small></div></header>
    <div className="inline-task-numbers">{(["score", "target"] as const).map((field) => <AutoSaveField key={field} initialValue={String(task[field])} onSave={(value) => {
      if (!value.trim()) return Promise.reject(new Error("Vui lòng nhập số, không để trống."));
      return save({ [field]: Number(value) });
    }}>
      {(value, change, commit) => <label className="form-field"><span>{field === "score" ? "Điểm hiện tại" : "Điểm mục tiêu"}</span><input type="number" min={10} max={90} step="any" value={value} onChange={(event) => change(event.target.value)} onBlur={() => commit()} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>}
    </AutoSaveField>)}</div>
    <AutoSaveField initialValue={{ names: task.assignees ?? [], users: task.assigneeUsers ?? [] }} onSave={({ names, users }) => save({ assignees: names, assigneeUsers: users })}>
      {(value, _change, commit) => <StaffSelect label="Người phụ trách task" names={value.names} selectedUsers={value.users} onChange={(names, users) => commit({ names, users })} />}
    </AutoSaveField>
  </article>;
}