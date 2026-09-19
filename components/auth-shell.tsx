import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import brandLogo from "@/images/logo/white-logo.png";

export default function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="auth-page">
    <section className="auth-intro">
      <div className="auth-brand"><Image src={brandLogo} alt="PTE Intensive" className="auth-logo" priority sizes="180px" /></div>
      <span className="auth-eyebrow">STUDENT PROGRESS TRACKING</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="auth-security"><ShieldCheck size={22} /><span>Nội dung chỉ dành cho tài khoản đã đăng nhập và được quản trị viên cấp quyền.</span></div>
    </section>
    <section className="auth-panel" aria-label={title}>{children}</section>
  </main>;
}