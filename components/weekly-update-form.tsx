"use client";

import { ClipboardCheck, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Student, WeeklyReport, WeeklyTaskResult, HomeworkStatus, ExamRecommendation } from "@/data/students";
import TaskNotesFields from "@/components/task-notes-fields";
import { applyWeeklyTask, validAbsences, HOMEWORK_LABELS, EXAM_LABELS } from "@/lib/student-tracking";
import { defaultWeekDates } from "@/lib/student-dates";

type WeeklyUpdateFormProps = {
  student: Student;
  reportIndex?: number;
  onCancel: () => void;
  onSave: (student: Student) => Promise<void>;
};

type FormState = {
  week: string; startDate: string; endDate: string; lessons: number;
  tasksCompleted: number; mockScore: number; attendance: number; note: string;
  taskResults: WeeklyTaskResult[];
  excusedAbsences: number | null; unexcusedAbsences: number | null;
  homeworkStatus: HomeworkStatus; examRecommendation: ExamRecommendation; limitations: string;
};

export default function WeeklyUpdateForm({ student, reportIndex, onCancel, onSave }: WeeklyUpdateFormProps) {
  const existingReport = reportIndex === undefined ? undefined : student.weeklyReports[reportIndex];
  const defaultDates = getDefaultDates(existingReport);
  const [form, setForm] = useState<FormState>({
    week: existingReport?.week ?? `Tuần ${student.weeklyReports.length + 1}`,
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    lessons: existingReport?.lessons ?? 0,
    tasksCompleted: existingReport?.tasksCompleted ?? 0,
    mockScore: existingReport?.mockScore ?? student.currentScore,
    attendance: existingReport?.attendance ?? 100,
    note: existingReport?.note ?? "",
    excusedAbsences: existingReport?.excusedAbsences ?? null,
    unexcusedAbsences: existingReport?.unexcusedAbsences ?? null,
    homeworkStatus: existingReport?.homeworkStatus ?? "not_recorded",
    examRecommendation: existingReport?.examRecommendation ?? "not_assessed",
    limitations: existingReport?.limitations ?? "",
    taskResults: student.tasks.map((task) => {
      const saved = existingReport?.taskResults?.find((item) => item.code === task.code);
      return { code: task.code, score: saved?.score ?? task.score, practiced: saved?.practiced ?? 0,
        assignees: saved?.assignees ?? (existingReport ? [] : task.assignees ?? []),
        progressText: saved?.progressText ?? (existingReport ? "" : task.progressText ?? ""),
        limitations: saved?.limitations ?? (existingReport ? "" : task.limitations ?? ""),
      };
    }),
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = existingReport !== undefined;

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const updateTask = (code: string, field: "score" | "practiced", value: number) => setForm((current) => ({
    ...current,
    taskResults: current.taskResults.map((task) => task.code === code ? { ...task, [field]: value } : task),
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.week.trim() || !form.startDate || !form.endDate) return setError("Vui lòng nhập tuần học và khoảng ngày.");
    if (form.endDate < form.startDate) return setError("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
    if (!validAbsences(form.excusedAbsences) || !validAbsences(form.unexcusedAbsences)) return setError("Số buổi vắng phải là số nguyên từ 0 đến 14 hoặc để trống.");
    const duplicate = student.weeklyReports.some((report, index) => index !== reportIndex && report.week.toLocaleLowerCase("vi") === form.week.trim().toLocaleLowerCase("vi"));
    if (duplicate) return setError("Tên tuần đã tồn tại. Hãy sửa báo cáo cũ hoặc dùng tên tuần khác.");

    const report: WeeklyReport = {
      ...existingReport, ...form,
      taskResults: [...form.taskResults, ...(existingReport?.taskResults ?? []).filter((result) => !student.tasks.some((task) => task.code === result.code))],
      week: form.week.trim(),
      dateRange: `${formatShortDate(form.startDate)} - ${formatShortDate(form.endDate)}`,
    };
    const weeklyReports = [...student.weeklyReports];
    if (reportIndex === undefined) weeklyReports.push(report); else weeklyReports[reportIndex] = report;

    const previousResults = new Map((existingReport?.taskResults ?? []).map((item) => [item.code, item.practiced]));
    const shouldSyncProfile = reportIndex === undefined || reportIndex === student.weeklyReports.length - 1;
    const tasks = student.tasks.map((task) => {
      const result = form.taskResults.find((item) => item.code === task.code);
      if (!result) return task;
      return applyWeeklyTask(task, result, previousResults.get(task.code) ?? 0, shouldSyncProfile);
    });
    const updatedStudent: Student = {
      ...student, weeklyReports, tasks,
      currentScore: shouldSyncProfile ? form.mockScore : student.currentScore,
      attendance: shouldSyncProfile ? form.attendance : student.attendance,
      lastActive: "Vừa cập nhật tuần",
    };

    setIsSaving(true);
    setError("");
    try { await onSave(updatedStudent); } catch { setError("Không thể lưu báo cáo tuần. Vui lòng thử lại."); setIsSaving(false); }
  }

  return <div className="modal-backdrop" onClick={onCancel}><form className="student-modal form-modal weekly-form-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
    <div className="form-header"><div><h2>{isEditing ? "Sửa báo cáo tuần" : "Cập nhật tình hình tuần"}</h2><p>{student.name} · {student.id}</p></div><button type="button" className="modal-close" onClick={onCancel} aria-label="Đóng"><X /></button></div>
    <div className="weekly-form-intro"><ClipboardCheck size={18} /><span>Ghi nhận kết quả học, mock test và tiến độ từng task trong tuần.</span></div>
    <div className="form-section"><h3>Thông tin tuần học</h3><div className="form-grid form-grid-3">
      <FormField label="Tuần học *"><input required value={form.week} onChange={(event) => update("week", event.target.value)} placeholder="Ví dụ: Tuần 5" /></FormField>
      <FormField label="Từ ngày *"><input required type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} /></FormField>
      <FormField label="Đến ngày *"><input required type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} /></FormField>
      <FormField label="Số buổi học"><NumberInput value={form.lessons} min={0} max={14} onChange={(value) => update("lessons", value)} /></FormField>
      <FormField label="Tổng task hoàn thành"><NumberInput value={form.tasksCompleted} min={0} max={5000} onChange={(value) => update("tasksCompleted", value)} /></FormField>
      <FormField label="Điểm mock PTE"><NumberInput value={form.mockScore} min={10} max={90} onChange={(value) => update("mockScore", value)} /></FormField>
      <FormField label="Chuyên cần (%)"><NumberInput value={form.attendance} min={0} max={100} onChange={(value) => update("attendance", value)} /></FormField>
    </div></div>
    <div className="form-section"><h3>Chuyên cần, bài tập và đánh giá thi</h3><div className="form-grid">
      <FormField label="Vắng có xin phép (buổi)"><input type="number" min={0} max={14} step={1} value={form.excusedAbsences ?? ""} placeholder="Chưa ghi nhận" onChange={(event) => update("excusedAbsences", event.target.value === "" ? null : Number(event.target.value))} /></FormField>
      <FormField label="Vắng không xin phép (buổi)"><input type="number" min={0} max={14} step={1} value={form.unexcusedAbsences ?? ""} placeholder="Chưa ghi nhận" onChange={(event) => update("unexcusedAbsences", event.target.value === "" ? null : Number(event.target.value))} /></FormField>
      <FormField label="Bài tập về nhà trong tuần"><select value={form.homeworkStatus} onChange={(event) => update("homeworkStatus", event.target.value as HomeworkStatus)}>{Object.entries(HOMEWORK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>
      <FormField label="Khuyến khích thi"><select value={form.examRecommendation} onChange={(event) => update("examRecommendation", event.target.value as ExamRecommendation)}>{Object.entries(EXAM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>
      <FormField label="Hạn chế của học viên trong tuần"><textarea rows={3} value={form.limitations} onChange={(event) => update("limitations", event.target.value)} /></FormField>
    </div><p>Số buổi vắng được lưu riêng; tỷ lệ chuyên cần vẫn nhập ở phần thông tin tuần học.</p></div>
    <div className="form-section"><div className="weekly-task-heading"><h3>Kết quả từng PTE Task</h3><span>Số câu là lượng luyện riêng trong tuần</span></div><div className="weekly-task-inputs">
      {student.tasks.map((task) => { const result = form.taskResults.find((item) => item.code === task.code)!; return <div className="weekly-task-row" key={task.code}><span className="task-code">{task.code}</span><div className="weekly-task-name"><strong>{task.name}</strong><small>{task.skill} · Mục tiêu {task.target}</small></div><FormField label="Điểm tuần"><NumberInput value={result.score} min={10} max={90} onChange={(value) => updateTask(task.code, "score", value)} /></FormField><FormField label="Số câu đã luyện"><NumberInput value={result.practiced} min={0} max={5000} onChange={(value) => updateTask(task.code, "practiced", value)} /></FormField><TaskNotesFields value={result} onChange={(notes) => setForm((current) => ({ ...current, taskResults: current.taskResults.map((item) => item.code === task.code ? { ...item, ...notes } : item) }))} /></div>; })}
    </div></div>
    <div className="form-section"><h3>Nhận xét của giáo viên</h3><FormField label="Tình hình, điểm tiến bộ và nội dung cần cải thiện"><textarea rows={4} value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Ví dụ: RS tiến bộ tốt, tuần tới cần tập trung thêm WFD..." /></FormField></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Hủy</button><button type="submit" className="button primary" disabled={isSaving}><Save size={17} />{isSaving ? "Đang lưu..." : isEditing ? "Lưu báo cáo" : "Thêm báo cáo tuần"}</button></div>
  </form></div>;
}

function getDefaultDates(report?: WeeklyReport) {
  if (report?.startDate && report.endDate) return { startDate: report.startDate, endDate: report.endDate };
  if (report?.dateRange) {
    const [start, end] = report.dateRange.split(" - ");
    const parse = (value: string) => { const [day, month] = value.split("/"); return day && month ? `2026-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : ""; };
    const parsed = { startDate: parse(start), endDate: parse(end) };
    if (parsed.startDate && parsed.endDate) return parsed;
  }
  if (report) return { startDate: report.startDate ?? "", endDate: report.endDate ?? "" };
  return defaultWeekDates();
}

const formatShortDate = (date: string) => { const [year, month, day] = date.split("-"); return `${day}/${month}/${year}`; };
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) { return <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />; }