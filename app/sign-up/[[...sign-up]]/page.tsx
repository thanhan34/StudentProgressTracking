import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { getCurrentAccess } from "@/lib/auth";
import { canAccessContent } from "@/lib/roles";

export default async function SignUpPage() {
  const access = await getCurrentAccess();
  if (access) redirect(canAccessContent(access.role) ? "/" : "/pending-approval");
  return (
    <AuthShell title="Tham gia PTE Intensive" description="Tạo tài khoản của bạn. Sau khi đăng ký, quản trị viên cần cấp quyền trước khi bạn truy cập hệ thống.">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/pending-approval" />
    </AuthShell>
  );
}
