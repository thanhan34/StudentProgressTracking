"use client";

import { useActionState } from "react";
import { assignRole } from "@/app/admin/users/actions";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

export default function RoleForm({ userId, role, locked }: { userId: string; role: UserRole; locked: boolean }) {
  const [state, action, pending] = useActionState(assignRole, { success: false, message: "" });

  return (
    <form action={action} className="role-form">
      <input type="hidden" name="userId" value={userId} />
      <select name="role" defaultValue={role} aria-label="Role" disabled={locked || pending}>
        {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <button className="button primary" disabled={locked || pending}>{pending ? "Đang lưu…" : "Lưu role"}</button>
      {locked && <small>Admin mặc định hoặc tài khoản của bạn — không thể tự hạ quyền.</small>}
      {state.message && <p role="status" className={state.success ? "role-success" : "role-error"}>{state.message}</p>}
    </form>
  );
}