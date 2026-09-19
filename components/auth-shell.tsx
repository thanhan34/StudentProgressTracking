import { GraduationCap, ShieldCheck } from "lucide-react";

export default function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="auth-page">
    <section className="auth-intro">
      <div className="auth-brand"><GraduationCap size={32} /> PTE Intensive</div>
      <span className="auth-eyebrow">STUDENT PROGRESS TRACKING</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="auth-security"><ShieldCheck size={22} /><span>Nội dung chỉ dành cho tài khoản đã đăng nhập và được quản trị viên cấp quyền.</span></div>
    </section>
    <section className="auth-panel" aria-label={title}>{children}</section>
  </main>;
}