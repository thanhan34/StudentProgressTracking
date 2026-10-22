import { isBootstrapAdmin, type UserRole } from "./roles";

export type DeleteUserState = { success: boolean; message: string };
type Access = { userId: string; role: UserRole } | null;
type TargetUser = Parameters<typeof isBootstrapAdmin>[0];

export function userDeletionRestriction(currentUserId: string, targetUserId: string, bootstrapAdmin: boolean): string | null {
  if (currentUserId === targetUserId) return "Bạn không thể xóa tài khoản đang đăng nhập.";
  if (bootstrapAdmin) return "Không thể xóa tài khoản admin mặc định.";
  return null;
}

export async function performUserDeletion(formData: FormData, dependencies: {
  getAccess: () => Promise<Access>;
  getUser: (userId: string) => Promise<TargetUser>;
  deleteUser: (userId: string) => Promise<unknown>;
}): Promise<DeleteUserState> {
  try {
    const access = await dependencies.getAccess();
    if (access?.role !== "admin") return { success: false, message: "Chỉ Administrator được phép xóa tài khoản." };

    const userId = formData.get("userId");
    if (typeof userId !== "string" || !/^user_[a-zA-Z0-9]+$/.test(userId)) {
      return { success: false, message: "Tài khoản không hợp lệ." };
    }
    if (formData.get("confirmUserId") !== userId) {
      return { success: false, message: "Vui lòng xác nhận tài khoản cần xóa." };
    }
    const selfRestriction = userDeletionRestriction(access.userId, userId, false);
    if (selfRestriction) return { success: false, message: selfRestriction };

    const target = await dependencies.getUser(userId);
    const restriction = userDeletionRestriction(access.userId, userId, isBootstrapAdmin(target));
    if (restriction) return { success: false, message: restriction };

    await dependencies.deleteUser(userId);
    return { success: true, message: "Đã xóa tài khoản." };
  } catch {
    return { success: false, message: "Không thể xóa tài khoản. Vui lòng tải lại danh sách rồi thử lại." };
  }
}