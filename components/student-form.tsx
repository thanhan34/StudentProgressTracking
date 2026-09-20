"use client";

import { Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import StaffSelect from "@/components/staff-select";
import type { AssignedUser } from "@/lib/staff";
import { STUDENT_STATUSES, type PteSkill, type Student, type StudentStatus, type StudyPhase, type TaskProgress } from "@/data/students";
import { generateStudentId } from "@/lib/student-id";
import { createDefaultTasks } from "@/lib/pte-tasks";
import { toDateInput } from "@/lib/student-dates";

type StudentFormProps = {
  student: Student | null;
  existingIds: string[];
  onCancel: () => void;
  onSave: (student: Student) => Promise<void>;
};

type FormState = {
  instructorUsers: AssignedUser[]; teachingAssistantUsers: AssignedUser[];
  id: string; name: string; instructors: string[]; teachingAssistants: string[]; startDate: string;
  examDate: string; phase: StudyPhase; status: StudentStatus; targetScore: number;
  currentScore: number; attendance: number; skills: Record<PteSkill, number>;
};

const defaultForm: FormState = {
  instructorUsers: [], teachingAssistantUsers: [],
  id: "", name: "", instructors: [], teachingAssistants: [], startDate: "", examDate: "",
  phase: "Nền tảng", status: "Đang học", targetScore: 65, currentScore: 30,
  attendance: 100, skills: { Speaking: 30, Writing: 30, Reading: 30, Listening: 30 },
};

export default function StudentForm({ student, existingIds, onCancel, onSave }: StudentFormProps) {
  const [form, setForm] = useState<FormState>(() => student ? {
    instructorUsers: student.instructorUsers ?? [], teachingAssistantUsers: student.teachingAssistantUsers ?? [],
    id: student.id, name: student.name,
    instructors: [...student.instructors], teachingAssistants: [...student.teachingAssistants],
    startDate: student.startDate, examDate: student.examDate ?? "", phase: student.phase,
    status: student.status, targetScore: student.targetScore, currentScore: student.currentScore,
    attendance: student.attendance, skills: { ...student.skills },
  } : { ...defaultForm, id: generateStudentId(), startDate: toDateInput() });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(student);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const updateSkill = (skill: PteSkill, value: number) => setForm((current) => ({ ...current, skills: { ...current.skills, [skill]: value } }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = form.id.trim().toUpperCase();
    if (!id || !form.name.trim() || !form.startDate) return setError("Vui lòng nhập họ tên và ngày bắt đầu.");
    if (!isEditing && existingIds.includes(id)) return setError("Không thể tạo hồ sơ lúc này. Vui lòng đóng form và thử lại.");
    if (form.examDate && form.examDate < form.startDate) return setError("Ngày thi dự kiến phải sau ngày bắt đầu học.");

    const initials = form.name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
    const tasks: TaskProgress[] = student?.tasks ?? createDefaultTasks(form.skills);
    const result: Student = {
      ...student, ...form, id, name: form.name.trim(), initials,
      color: student?.color ?? "#fc5d01", lastActive: student?.lastActive ?? "Vừa thêm",
      tasks, weeklyReports: student?.weeklyReports ?? [],
    };

    setIsSaving(true);
    setError("");
    try { await onSave(result); } catch { setError("Không thể lưu học viên. Vui lòng thử lại."); setIsSaving(false); }
  }

  return <div className="modal-backdrop" onClick={onCancel}><form className="student-modal form-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
    <div className="form-header"><div><h2>{isEditing ? "Sửa học viên PTE" : "Thêm học viên PTE"}</h2><p>{isEditing ? `Cập nhật thông tin ${student?.name}` : "Nhập hồ sơ và mục tiêu học tập ban đầu."}</p></div><button type="button" className="modal-close" onClick={onCancel} aria-label="Đóng"><X /></button></div>
    <div className="form-section"><h3>Thông tin học viên</h3><div className="form-grid">
      <FormField label="Họ và tên *"><input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nguyễn Văn An" /></FormField>
    </div></div>
    <div className="form-section"><h3>Đội ngũ hỗ trợ</h3><div className="form-grid support-form-grid">
      <StaffSelect label="Giảng viên phụ trách" names={form.instructors} selectedUsers={form.instructorUsers} onChange={(instructors, instructorUsers) => setForm((current) => ({ ...current, instructors, instructorUsers }))} />
      <StaffSelect label="Trợ giảng hỗ trợ" names={form.teachingAssistants} selectedUsers={form.teachingAssistantUsers} onChange={(teachingAssistants, teachingAssistantUsers) => setForm((current) => ({ ...current, teachingAssistants, teachingAssistantUsers }))} />
    </div></div>
    <div className="form-section"><h3>Lộ trình học và kỳ thi</h3><div className="form-grid form-grid-3">
      <FormField label="Ngày bắt đầu *"><input required type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} /></FormField>
      <FormField label="Ngày thi dự kiến (không bắt buộc)"><input type="date" min={form.startDate || undefined} value={form.examDate} onChange={(event) => update("examDate", event.target.value)} /><small>Có thể bổ sung khi học viên có lịch thi.</small></FormField>
      <FormField label="Giai đoạn"><select value={form.phase} onChange={(event) => update("phase", event.target.value as StudyPhase)}><option>Nền tảng</option><option>Luyện task</option><option>Mock test</option><option>Nước rút</option></select></FormField>
      <FormField label="Điểm hiện tại"><ScoreInput value={form.currentScore} onChange={(value) => update("currentScore", value)} /></FormField>
      <FormField label="Điểm mục tiêu"><ScoreInput value={form.targetScore} onChange={(value) => update("targetScore", value)} /></FormField>
      <FormField label="Chuyên cần (%)"><input type="number" min="0" max="100" value={form.attendance} onChange={(event) => update("attendance", Number(event.target.value))} /></FormField>
      <FormField label="Trạng thái"><select value={form.status} onChange={(event) => update("status", event.target.value as StudentStatus)}>{STUDENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></FormField>
    </div></div>
    <div className="form-section"><h3>Điểm theo kỹ năng</h3><div className="skill-inputs">{(Object.keys(form.skills) as PteSkill[]).map((skill) => <FormField label={skill} key={skill}><ScoreInput value={form.skills[skill]} onChange={(value) => updateSkill(skill, value)} /></FormField>)}</div></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Hủy</button><button type="submit" className="button primary" disabled={isSaving}><Save size={17} />{isSaving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm học viên"}</button></div>
  </form></div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function ScoreInput({ value, onChange }: { value: number; onChange: (value: number) => void }) { return <input type="number" min="10" max="90" value={value} onChange={(event) => onChange(Number(event.target.value))} />; }
