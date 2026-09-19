import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { getCurrentAccess } from "@/lib/auth";
import { canAccessContent } from "@/lib/roles";

export default async function SignInPage() {
  const access = await getCurrentAccess();
  if (access) redirect(canAccessContent(access.role) ? "/" : "/pending-approval");
  return (
    <AuthShell title="Chào mừng bạn trở lại" description="Đăng nhập để theo dõi tiến độ học viên và đồng hành cùng đội ngũ PTE Intensive.">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/" />
    </AuthShell>
  );
}
