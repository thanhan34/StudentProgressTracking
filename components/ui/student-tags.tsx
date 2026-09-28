"use client";

import { useRef, useState } from "react";
import { STUDENT_TAGS, normalizeStudentTags, type StudentTag } from "@/data/students";

export function StudentTags({ tags }: { tags?: StudentTag[] }) {
  const selected = normalizeStudentTags(tags);
  if (!selected.length) return null;
  return <div className="student-tags" aria-label="Tag học viên">
    {selected.map((tag) => <span className="student-tag" key={tag}>{tag}</span>)}
  </div>;
}

export function StudentTagInput({ value, onChange, disabled = false, autoSave = false }: {
  value: StudentTag[];
  onChange: (tags: StudentTag[]) => void;
  disabled?: boolean;
  autoSave?: boolean;
}) {
  return <fieldset className="student-tag-fieldset" disabled={disabled}>
    <legend>Tag học viên</legend>
    <p>{autoSave ? "Chọn hoặc bỏ chọn tag để tự động lưu ngay." : "Có thể chọn nhiều tag. Bỏ chọn để gỡ tag khỏi học viên."}</p>
    <div className="student-tag-options">{STUDENT_TAGS.map((tag) => <label className="student-tag-option" key={tag}>
      <input type="checkbox" checked={value.includes(tag)} onChange={(event) => onChange(
        normalizeStudentTags(event.target.checked ? [...value, tag] : value.filter((item) => item !== tag)),
      )} />
      <span>{tag}</span>
    </label>)}</div>
  </fieldset>;
}

export function StudentTagEditor({ tags, onSave }: {
  tags?: StudentTag[];
  onSave: (tags: StudentTag[]) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => normalizeStudentTags(tags));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saving = useRef(false);

  async function changeTags(next: StudentTag[]) {
    if (saving.current) return;
    saving.current = true;
    const previous = draft;
    setDraft(next);
    setStatus("saving");
    try {
      await onSave(next);
      setStatus("saved");
    } catch {
      setDraft(previous);
      setStatus("error");
    } finally {
      saving.current = false;
    }
  }

  return <div className="student-tag-editor" aria-busy={status === "saving"}>
    <StudentTagInput value={draft} onChange={changeTags} disabled={status === "saving"} autoSave />
    <p className="student-tag-feedback" role="status">{status === "saving" ? "Đang lưu tag…" : status === "saved" ? "Đã lưu tag." : ""}</p>
    {status === "error" && <p className="role-error" role="alert">Không thể lưu tag. Đã khôi phục lựa chọn trước đó. Vui lòng chọn lại để thử lưu.</p>}
  </div>;
}