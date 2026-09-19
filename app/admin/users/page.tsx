import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { requireApprovedAccess } from "@/lib/auth";
import { isBootstrapAdmin, resolveRole } from "@/lib/roles";
import RoleForm from "@/components/role-form";

const PAGE_SIZE = 20;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const access = await requireApprovedAccess();
  if (access.role !== "admin") {
    return <main className="admin-page"><h1>Không có quyền truy cập</h1><p>Chỉ Administrator được quản lý role.</p><Link href="/">Về tổng quan</Link></main>;
  }

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const parsedPage = Number(params.page ?? 1);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;
  const client = await clerkClient();
  const { data: users, totalCount } = await client.users.getUserList({
    limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, ...(query ? { query } : {}),
  });
  const pageLink = (nextPage: number) => `/admin/users?${new URLSearchParams({ q: query, page: String(nextPage) })}`;

  return (
    <main className="admin-page">
      <Link href="/">← Về tổng quan</Link>
      <h1>Quản lý tài khoản</h1>
      <p>Tài khoản mới ở trạng thái Pending Approval và chưa được xem nội dung. Chọn một role khác để duyệt; chọn Pending Approval để thu hồi quyền truy cập.</p>
      <form className="role-search" action="/admin/users">
        <input name="q" defaultValue={query} placeholder="Tìm theo tên hoặc email" aria-label="Tìm tài khoản" maxLength={200} />
        <button className="button secondary">Tìm kiếm</button>
      </form>
      <p>{totalCount} tài khoản · Trang {page}</p>
      <div className="role-user-list">
        {users.map((user) => {
          const email = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress;
          const role = resolveRole(user);
          return <article className="card role-user" key={user.id}>
            <div><h2>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Chưa có tên"}</h2><p>{email || "Chưa có email chính"}</p></div>
            <RoleForm key={`${user.id}-${role}`} userId={user.id} role={role} locked={isBootstrapAdmin(user) || user.id === access.userId} />
          </article>;
        })}
        {!users.length && <p>Không tìm thấy tài khoản. Người dùng cần đăng ký trước khi được gán role.</p>}
      </div>
      <nav className="role-pagination" aria-label="Phân trang tài khoản">
        {page > 1 && <Link href={pageLink(page - 1)}>← Trang trước</Link>}
        {page * PAGE_SIZE < totalCount && <Link href={pageLink(page + 1)}>Trang sau →</Link>}
      </nav>
    </main>
  );
}