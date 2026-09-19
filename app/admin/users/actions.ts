"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getCurrentAccess } from "@/lib/auth";
import { isBootstrapAdmin, isUserRole } from "@/lib/roles";

export type RoleActionState = { success: boolean; message: string };

export async function assignRole(_previous: RoleActionState, formData: FormData): Promise<RoleActionState> {
  try {
    const access = await getCurrentAccess();
    if (access?.role !== "admin") {
      return { success: false, message: "Chỉ Administrator được phép gán role." };
    }

    const userId = formData.get("userId");
    const role = formData.get("role");
    if (typeof userId !== "string" || !userId.startsWith("user_") || !isUserRole(role)) {
      return { success: false, message: "Tài khoản hoặc role không hợp lệ." };
    }

    const client = await clerkClient();
    const target = await client.users.getUser(userId);
    if (isBootstrapAdmin(target) && role !== "admin") {
      return { success: false, message: "Không thể hạ quyền admin mặc định." };
    }
    if (userId === access.userId && role !== "admin") {
      return { success: false, message: "Bạn không thể tự hạ quyền của mình." };
    }

    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
    revalidatePath("/", "layout");
    return { success: true, message: "Đã cập nhật role." };
  } catch {
    return { success: false, message: "Không thể cập nhật role. Vui lòng thử lại." };
  }
}