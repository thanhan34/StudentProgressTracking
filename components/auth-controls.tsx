"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRole } from "@/components/role-provider";
import { ROLE_LABELS } from "@/lib/roles";

export default function AuthControls() {
  const role = useRole();
  return (
    <div className="auth-controls" aria-label="Tài khoản">
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button className="button secondary">Đăng nhập</button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button className="button primary">Đăng ký</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        {role && <span className="role-badge">{ROLE_LABELS[role]}</span>}
        {role === "admin" && <Link className="role-management-link" href="/admin/users">Quản lý tài khoản</Link>}
        <UserButton showName />
      </Show>
    </div>
  );
}