"use client";

import { BookOpenCheck, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { PteSkill, Student, TaskProgress } from "@/data/students";
import TaskNotesFields from "@/components/task-notes-fields";
import { TaskNotesDetails } from "@/components/tracking-details";
import { addMissingDefaultTasks, defaultTaskCodes, defaultTaskTarget, pteTaskTemplates } from "@/lib/pte-tasks";

type TaskManagerProps = {
  student: Student;
  onClose: () => void;
  onSave: (student: Student) => Promise<void>;
};

type TaskDraft = TaskProgress;

const emptyTask = (target = defaultTaskTarget): TaskDraft => ({
  code: "", name: "", skill: "Speaking", score: 30, target, practiced: 0,
});

export default function TaskManager({ student, onClose, onSave }: TaskManagerProps) {
  const [currentStudent, setCurrentStudent] = useState(student);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [originalCode, setOriginalCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const beginAdd = () => { setDraft(emptyTask()); setOriginalCode(null); setDeletingCode(null); setError(""); };
  const beginEdit = (task: TaskProgress) => { setDraft({ ...task }); setOriginalCode(task.code); setDeletingCode(null); setError(""); };
  const update = <K extends keyof TaskDraft>(field: K, value: TaskDraft[K]) => setDraft((current) => current ? { ...current, [field]: value } : current);

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const code = draft.code.trim().toUpperCase();
    const name = draft.name.trim();
    if (!code || !name) return setError("Mã task và tên task là bắt buộc.");
    if (code !== originalCode && !pteTaskTemplates.some((task) => task.code === code)) return setError("Vui lòng chọn phần thi trong danh sách.");
    if (!/^[A-Z0-9-]{1,15}$/.test(code)) return setError("Mã task chỉ gồm chữ in hoa, số hoặc dấu gạch ngang.");
    const duplicated = currentStudent.tasks.some((task) => task.code.toUpperCase() === code && task.code !== originalCode);
    if (duplicated) return setError("Mã task đã tồn tại trong hồ sơ học viên.");

    const task: TaskProgress = { ...draft, code, name };
    const tasks = originalCode
      ? currentStudent.tasks.map((item) => item.code === originalCode ? task : item)
      : [...currentStudent.tasks, task];
    const weeklyReports = originalCode && originalCode !== code
      ? currentStudent.weeklyReports.map((report) => ({
          ...report,
          ...(report.taskResults ? { taskResults: report.taskResults.map((result) => result.code === originalCode ? { ...result, code } : result) } : {}),
        }))
      : currentStudent.weeklyReports;
    const saved = await persist({ ...currentStudent, tasks, weeklyReports, lastActive: "Vừa cập nhật tasks" });
    if (saved) { setDraft(null); setOriginalCode(null); }
  }

  async function deleteTask(code: string) {
    const tasks = currentStudent.tasks.filter((task) => task.code !== code);
    const saved = await persist({ ...currentStudent, tasks, lastActive: "Vừa cập nhật tasks" });
    if (saved) {
      setDeletingCode(null);
      if (originalCode === code) { setDraft(null); setOriginalCode(null); }
    }
  }

  async function persist(updatedStudent: Student) {
    setIsSaving(true);
    setError("");
    try {
      await onSave(updatedStudent);
      setCurrentStudent(updatedStudent);
      return true;
    } catch {
      setError("Không thể lưu thay đổi task. Vui lòng thử lại.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return <div className="modal-backdrop" onClick={onClose}><article className="student-modal form-modal task-manager-modal" onClick={(event) => event.stopPropagation()}>
    <div className="form-header"><div><h2>Quản lý PTE Tasks</h2><p>{currentStudent.name}</p></div><button type="button" className="modal-close" onClick={onClose} aria-label="Đóng"><X /></button></div>
    <div className="task-manager-toolbar"><div><BookOpenCheck size={18} /><span><strong>{currentStudent.tasks.length} tasks</strong><small>Danh sách task đang theo dõi</small></span></div><button className="button primary compact" onClick={beginAdd} disabled={isSaving}><Plus size={16} />Thêm task</button></div>
    {defaultTaskCodes.some((code) => !currentStudent.tasks.some((task) => task.code.toUpperCase() === code)) && <div className="task-manager-toolbar"><small>Task mặc định: DI, RL, SGD, SWT, HIW, WFD</small><button type="button" className="button secondary compact" disabled={isSaving} onClick={() => void persist({ ...currentStudent, tasks: addMissingDefaultTasks(currentStudent.tasks, currentStudent.skills), lastActive: "Vừa cập nhật tasks" })}><Plus size={16} />Bổ sung task mặc định</button></div>}

    {draft && <form className="task-editor" onSubmit={saveTask}>
      <div className="task-editor-heading"><strong>{originalCode ? `Sửa task ${originalCode}` : "Thêm task mới"}</strong><button type="button" onClick={() => { setDraft(null); setOriginalCode(null); setError(""); }} aria-label="Đóng form task"><X size={15} /></button></div>
      <div className="task-editor-grid">
        <FormField label="Phần thi PTE *"><select required autoFocus disabled={isSaving} value={draft.code} onChange={(event) => {
          const template = pteTaskTemplates.find((task) => task.code === event.target.value);
          if (template) setDraft((current) => current ? { ...current, ...template } : current);
        }}>
          <option value="" disabled>Chọn phần thi</option>
          {originalCode && !pteTaskTemplates.some((task) => task.code === originalCode) && <option value={originalCode}>{originalCode} — {currentStudent.tasks.find((task) => task.code === originalCode)?.name} (task đã lưu)</option>}
          {(["Speaking", "Writing", "Reading", "Listening"] as PteSkill[]).map((skill) => <optgroup key={skill} label={skill}>{pteTaskTemplates.filter((task) => task.skill === skill).map((task) => <option key={task.code} value={task.code} disabled={currentStudent.tasks.some((item) => item.code.toUpperCase() === task.code && item.code !== originalCode)}>{task.code} — {task.name}</option>)}</optgroup>)}
        </select></FormField>
        <FormField label="Tên task"><input readOnly value={draft.name} /></FormField>
        <FormField label="Kỹ năng"><input readOnly value={draft.code ? draft.skill : ""} /></FormField>
        <FormField label="Điểm hiện tại"><NumberInput value={draft.score} min={10} max={90} onChange={(value) => update("score", value)} /></FormField>
        <FormField label="Điểm mục tiêu"><NumberInput value={draft.target} min={10} max={90} onChange={(value) => update("target", value)} /></FormField>
        <FormField label="Tổng số câu đã luyện"><NumberInput value={draft.practiced} min={0} max={99999} onChange={(value) => update("practiced", value)} /></FormField>
        <TaskNotesFields key={originalCode ?? "new"} value={draft} onChange={(notes) => setDraft((current) => current ? { ...current, ...notes } : current)} />
      </div>
      <div className="task-editor-actions"><button type="button" className="button secondary" onClick={() => { setDraft(null); setOriginalCode(null); }}>Hủy</button><button type="submit" className="button primary" disabled={isSaving}><Save size={16} />{isSaving ? "Đang lưu..." : originalCode ? "Lưu task" : "Thêm task"}</button></div>
    </form>}

    {error && <div className="form-error task-manager-error" role="alert">{error}</div>}
    <div className="managed-task-list">
      {currentStudent.tasks.map((task) => <div className="managed-task" key={task.code}>
        <span className="task-code">{task.code}</span><div className="managed-task-info"><strong>{task.name}</strong><small>{task.skill}</small></div>
        <div className="managed-task-stat"><small>Điểm</small><strong>{task.score}<span>/{task.target}</span></strong></div>
        <div className="managed-task-stat"><small>Đã luyện</small><strong>{task.practiced}<span> câu</span></strong></div>
        <TaskNotesDetails task={task} />
        <div className="row-actions"><button className="edit" onClick={() => beginEdit(task)} aria-label={`Sửa task ${task.code}`} title="Sửa task"><Pencil size={15} /></button><button className="delete" onClick={() => setDeletingCode(task.code)} aria-label={`Xóa task ${task.code}`} title="Xóa task"><Trash2 size={15} /></button></div>
        {deletingCode === task.code && <div className="task-delete-confirm"><p>Xóa <strong>{task.code}</strong> khỏi tiến độ hiện tại? Dữ liệu trong báo cáo tuần cũ vẫn được giữ.</p><div><button className="button secondary" onClick={() => setDeletingCode(null)} disabled={isSaving}>Hủy</button><button className="button danger solid" onClick={() => void deleteTask(task.code)} disabled={isSaving}><Trash2 size={15} />{isSaving ? "Đang xóa..." : "Xóa task"}</button></div></div>}
      </div>)}
      {!currentStudent.tasks.length && <div className="managed-task-empty"><BookOpenCheck size={29} /><strong>Chưa có PTE task</strong><p>Thêm task đầu tiên để theo dõi trong báo cáo tuần.</p><button className="button primary" onClick={beginAdd}><Plus size={16} />Thêm task</button></div>}
    </div>
    <div className="task-manager-footer"><span>Mọi thay đổi được lưu tự động vào hồ sơ học viên.</span><button className="button secondary" onClick={onClose}>Đóng</button></div>
  </article></div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) { return <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />; }