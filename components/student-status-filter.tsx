"use client";

import { useEffect, useRef } from "react";
import { STUDENT_STATUSES, type StudentStatus } from "@/data/students";
import { DEFAULT_STUDENT_STATUSES, toggleStudentStatus } from "@/lib/student-status-filter";

export default function StudentStatusFilter({ selected, onChange }: {
  selected: StudentStatus[];
  onChange: (statuses: StudentStatus[]) => void;
}) {
  const dropdown = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && dropdown.current && !dropdown.current.contains(event.target)) {
        dropdown.current.open = false;
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  const label = selected.length === STUDENT_STATUSES.length ? "Tất cả trạng thái"
    : selected.length ? STUDENT_STATUSES.filter((status) => selected.includes(status)).join(", ") : "Chưa chọn trạng thái";

  return <details className="student-status-filter" ref={dropdown} onKeyDown={(event) => {
    if (event.key === "Escape" && dropdown.current?.open) {
      dropdown.current.open = false;
      dropdown.current.querySelector("summary")?.focus();
    }
  }}>
    <summary aria-label={`Lọc trạng thái: ${label}`}>{label}</summary>
    <div className="student-status-options">
      <div className="student-status-filter-actions">
        <button type="button" onClick={() => onChange([...STUDENT_STATUSES])}>Chọn tất cả</button>
        <button type="button" onClick={() => onChange([])}>Bỏ chọn tất cả</button>
        <button type="button" onClick={() => onChange([...DEFAULT_STUDENT_STATUSES])}>Mặc định</button>
      </div>
      <fieldset>
        <legend>Chọn một hoặc nhiều trạng thái</legend>
        {STUDENT_STATUSES.map((status) => <label key={status}>
          <input type="checkbox" checked={selected.includes(status)} onChange={() => onChange(toggleStudentStatus(selected, status))} />
          <span>{status}</span>
        </label>)}
      </fieldset>
      {!selected.length && <p>Chọn ít nhất một trạng thái để hiển thị học viên.</p>}
    </div>
  </details>;
}