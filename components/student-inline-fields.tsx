"use client";

import { STUDENT_STATUSES, type Student, type TaskProgress } from "@/data/students";
import type { StudentInlineChange, TaskInlinePatch } from "@/lib/student-inline";
import AutoSaveField from "@/components/ui/auto-save-field";
import StaffSelect from "@/components/staff-select";

export type InlineSave = (change: StudentInlineChange) => Promise<void>;

export function InlineExamRecommenders({ student, onSave }: { student: Student; onSave: InlineSave }) {
  return <div className="student-exam-recommenders">
    <AutoSaveField initialValue={{ names: student.examRecommenders ?? [], users: student.examRecommenderUsers ?? [] }} onSave={({ names, users }) => onSave({ kind: "examRecommenders", names, users })}>
      {(value, _change, commit) => <StaffSelect label="Người đề xuất đi thi" placeholder="Chọn người đề xuất đi thi" names={value.names} selectedUsers={value.users} onChange={(names, users) => commit({ names, users })} />}
    </AutoSaveField>
    <p className="inline-save-hint">Có thể chọn nhiều người. Tự lưu khi chọn hoặc bỏ người; không thay đổi trạng thái học viên hay đánh giá thi trong báo cáo tuần.</p>
  </div>;
}

export function InlineStudentStatus({ student, onSave }: { student: Student; onSave: InlineSave }) {
  return <div className="student-inline-status">
    <AutoSaveField key={student.status} initialValue={student.status} onSave={(value) => onSave({ kind: "status", value })}>
      {(value, _change, commit) => <label className="form-field">
        <span>Trạng thái học viên</span>
        <select value={value} onChange={(event) => {
          const status = STUDENT_STATUSES.find((status) => status === event.target.value);
          if (status) commit(status);
        }}>{STUDENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        <small>Tự lưu khi chọn. Chuyển sang “Đã thi đậu” ghi ngày hôm nay; chuyển sang trạng thái khác xóa ngày ghi nhận thi đậu.</small>
      </label>}
    </AutoSaveField>
  </div>;
}

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
    {(value, _change, commit) => <label className="form-field"><span>Ngày đăng ký thi</span><input type="date" min={student.startDate || undefined} value={value} onChange={(event) => commit(event.target.value)} /><small>Chọn ngày thi đã đăng ký để tự lưu và chuyển trạng thái sang “Đã đăng ký thi”. Xóa ngày không tự thay đổi trạng thái.</small></label>}
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