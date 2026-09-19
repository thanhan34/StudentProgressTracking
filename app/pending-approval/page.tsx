import { SignOutButton } from "@clerk/nextjs";
import { Clock3 } from "lucide-react";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { getCurrentAccess } from "@/lib/auth";
import { canAccessContent } from "@/lib/roles";

export default async function PendingApprovalPage() {
  const access = await getCurrentAccess();
  if (!access) redirect("/sign-in");
  if (canAccessContent(access.role)) redirect("/");

  return <AuthShell title="Chờ cấp quyền truy cập" description="Bạn đã đăng nhập thành công. Chỉ còn một bước để bắt đầu sử dụng hệ thống.">
    <div className="approval-card">
      <Clock3 size={40} aria-hidden="true" />
      <span className="role-badge">Pending Approval</span>
      <h2>Tài khoản đang chờ duyệt</h2>
      <p>Vui lòng liên hệ quản trị viên để được gán vai trò. Trong thời gian chờ, bạn chưa thể xem nội dung hoặc dữ liệu học viên.</p>
      <div className="approval-actions">
        <a className="button primary" href="/pending-approval">Kiểm tra quyền truy cập</a>
        <SignOutButton redirectUrl="/sign-in"><button className="button secondary">Đăng xuất</button></SignOutButton>
      </div>
      <small>Sau khi được duyệt, nhấn kiểm tra để vào hệ thống. Không cần tạo tài khoản mới.</small>
    </div>
  </AuthShell>;
}