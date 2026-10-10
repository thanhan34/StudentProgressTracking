"use client";

import { BookOpenCheck, ClipboardList } from "lucide-react";
import type { Student } from "@/data/students";
import { Button } from "@/components/ui/button";

export default function DashboardWorkspace({ mode, students, loading, error, onManage, onReport, onProfile }: {
  mode: "PTE Tasks" | "Báo cáo tuần";
  students: Student[];
  loading: boolean;
  error: string;
  onManage: (student: Student) => void;
  onReport: (student: Student, index?: number) => void;
  onProfile: (student: Student) => void;
}) {
  return <section className="workspace-list" aria-label={mode}>
    {loading ? <p className="empty-state" role="status">Đang tải học viên…</p> : error ? <p className="empty-state" role="alert">{error}</p> : !students.length ? <p className="empty-state">Không tìm thấy học viên. Hãy thay đổi bộ lọc hoặc thêm học viên.</p> : students.map((student) => <article className="workspace-student" key={student.id}>
      <header><div><button type="button" className="student-profile-link" onClick={() => onProfile(student)}>{student.name}</button><p>{mode === "PTE Tasks" ? `${student.tasks.length} task trong lộ trình` : `${student.weeklyReports.length} báo cáo tuần đã lưu`}</p></div><Button onClick={() => mode === "PTE Tasks" ? onManage(student) : onReport(student)}>{mode === "PTE Tasks" ? <BookOpenCheck size={16} /> : <ClipboardList size={16} />}{mode === "PTE Tasks" ? "Quản lý tasks" : "Cập nhật tuần"}</Button></header>
      {mode === "PTE Tasks" ? student.tasks.length ? <ul className="workspace-tasks">{student.tasks.map((task) => <li key={task.code}><strong>{task.code}</strong><span>{task.name}</span><span>{task.score} / {task.target} điểm</span></li>)}</ul> : <p className="inline-save-hint">Chưa có task. Chọn “Quản lý tasks” để thêm.</p> : student.weeklyReports.length ? <ul className="workspace-reports">{student.weeklyReports.map((report, index) => <li key={`${report.week}-${index}`}><div><strong>{report.week}</strong><p>{report.dateRange} · {report.lessons} buổi · {report.tasksCompleted} task · Mock {report.mockScore}</p></div><Button onClick={() => onReport(student, index)}>Sửa báo cáo</Button></li>).reverse()}</ul> : <p className="inline-save-hint">Chưa có báo cáo tuần. Chọn “Cập nhật tuần” để ghi nhận.</p>}
    </article>)}
  </section>;
}