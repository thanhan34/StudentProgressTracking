"use client";

import { useActionState, useId, useRef } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/admin/users/actions";

export default function DeleteAccountForm({ userId, name, email, restriction }: {
  userId: string;
  name: string;
  email?: string;
  restriction: string | null;
}) {
  const [state, action, pending] = useActionState(deleteAccount, { success: false, message: "" });
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  return (
    <div className="account-delete">
      <button type="button" className="button danger" disabled={!!restriction || pending} aria-describedby={restriction ? `${id}-restriction` : undefined} onClick={() => dialog.current?.showModal()}>
        <Trash2 size={16} aria-hidden="true" />Xóa tài khoản
      </button>
      {restriction && <small id={`${id}-restriction`}>{restriction}</small>}
      <dialog ref={dialog} className="student-modal confirm-modal account-delete-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={(event) => { if (pending) event.preventDefault(); }}>
        <span className="confirm-icon"><Trash2 size={24} aria-hidden="true" /></span>
        <h2 id={`${id}-title`}>Xóa tài khoản?</h2>
        <p id={`${id}-description`}>Bạn có chắc muốn xóa tài khoản <strong>{name}</strong>{email && <> ({email})</>}? Thao tác này không thể hoàn tác. Tài khoản này sẽ không còn dùng để đăng nhập; hồ sơ học viên và báo cáo hiện có không bị xóa.</p>
        <form action={action}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="confirmUserId" value={userId} />
          {state.message && <p className={state.success ? "role-success" : "role-error"} role={state.success ? "status" : "alert"}>{state.message}</p>}
          <div className="form-actions">
            <button type="button" className="button secondary" autoFocus disabled={pending} onClick={() => dialog.current?.close()}>Hủy</button>
            <button type="submit" className="button danger solid" disabled={pending || state.success}>
              <Trash2 size={16} aria-hidden="true" />{pending ? "Đang xóa…" : "Xác nhận xóa"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}