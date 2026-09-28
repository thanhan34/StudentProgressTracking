"use client";

import { useState, type ReactNode } from "react";

export default function AutoSaveField<T>({ initialValue, onSave, children }: {
  initialValue: T;
  onSave: (value: T) => Promise<void>;
  children: (value: T, change: (value: T) => void, commit: (value?: T) => void) => ReactNode;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const change = (next: T) => { setValue(next); setStatus("idle"); setError(""); };

  async function commit(next = value) {
    if (status === "saving" || JSON.stringify(next) === JSON.stringify(saved)) return;
    setValue(next);
    setStatus("saving");
    setError("");
    try {
      await onSave(next);
      setSaved(next);
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setError(error instanceof Error && !('code' in error) ? error.message : "Không thể lưu. Vui lòng kiểm tra kết nối và thử lại.");
    }
  }

  return <div className="inline-save-field" data-unsaved={status === "saving" || JSON.stringify(value) !== JSON.stringify(saved)} aria-busy={status === "saving"}>
    <fieldset disabled={status === "saving"}>{children(value, change, (next) => { void commit(next); })}</fieldset>
    <small className="inline-save-status" role="status">{status === "saving" ? "Đang lưu…" : status === "saved" ? "Đã lưu." : JSON.stringify(value) !== JSON.stringify(saved) ? "Chưa lưu" : ""}</small>
    {status === "error" && <div className="inline-save-error" role="alert"><span>{error}</span><button type="button" className="text-button" onClick={() => { void commit(); }}>Thử lại</button><button type="button" className="text-button" onClick={() => change(saved)}>Hoàn tác</button></div>}
  </div>;
}