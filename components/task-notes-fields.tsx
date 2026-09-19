"use client";

import { useState } from "react";
import type { TaskNotes } from "@/data/students";
import { parseAssignees } from "@/lib/student-tracking";

export default function TaskNotesFields({ value, onChange }: { value: TaskNotes; onChange: (notes: TaskNotes) => void }) {
  const [names, setNames] = useState((value.assignees ?? []).join(", "));
  return <div className="tracking-fields">
    <label className="form-field"><span>Người phụ trách (có thể nhiều người)</span><textarea rows={2} value={names} onChange={(event) => { setNames(event.target.value); onChange({ assignees: parseAssignees(event.target.value) }); }} placeholder="Nhập tên, phân cách bằng dấu phẩy hoặc xuống dòng" /></label>
    <label className="form-field"><span>Tiến độ task (ghi chú)</span><textarea rows={3} value={value.progressText ?? ""} onChange={(event) => onChange({ progressText: event.target.value })} /></label>
    <label className="form-field"><span>Hạn chế cần cải thiện</span><textarea rows={3} value={value.limitations ?? ""} onChange={(event) => onChange({ limitations: event.target.value })} /></label>
  </div>;
}