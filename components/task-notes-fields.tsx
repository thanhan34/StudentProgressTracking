"use client";

import type { TaskNotes } from "@/data/students";
import StaffSelect from "@/components/staff-select";

export default function TaskNotesFields({ value, onChange }: { value: TaskNotes; onChange: (notes: TaskNotes) => void }) {
  return <div className="tracking-fields">
    <StaffSelect label="Người phụ trách (có thể nhiều người)" names={value.assignees ?? []} selectedUsers={value.assigneeUsers} onChange={(assignees, assigneeUsers) => onChange({ assignees, assigneeUsers })} />
    <label className="form-field"><span>Tiến độ task (ghi chú)</span><textarea rows={3} value={value.progressText ?? ""} onChange={(event) => onChange({ progressText: event.target.value })} /></label>
    <label className="form-field"><span>Hạn chế cần cải thiện</span><textarea rows={3} value={value.limitations ?? ""} onChange={(event) => onChange({ limitations: event.target.value })} /></label>
  </div>;
}