"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { useStaff } from "@/components/staff-provider";
import { ROLE_LABELS } from "@/lib/roles";
import { legacyAssignmentNames, type AssignedUser } from "@/lib/staff";

export default function StaffSelect({ label, names, selectedUsers = [], onChange }: {
  label: string;
  names: string[];
  selectedUsers?: AssignedUser[];
  onChange: (names: string[], users: AssignedUser[]) => void;
}) {
  const id = useId();
  const { users, loading, error, reload } = useStaff();
  const legacy = legacyAssignmentNames(names, selectedUsers);
  const available = users.filter((user) => !selectedUsers.some((selected) => selected.id === user.id));
  const update = (nextUsers: AssignedUser[], nextLegacy = legacy) => onChange([...nextUsers.map((user) => user.name), ...nextLegacy], nextUsers);

  return <div className="name-list-field">
    <label className="form-field" htmlFor={id}><span>{label}</span>
      <select id={id} value="" disabled={loading || Boolean(error) || !available.length} onChange={(event) => {
        const user = available.find((item) => item.id === event.target.value);
        if (user) update([...selectedUsers, { id: user.id, name: user.name }]);
      }}>
        <option value="">{loading ? "Đang tải danh sách..." : error ? "Không tải được danh sách" : !users.length ? "Chưa có tài khoản phù hợp" : !available.length ? "Đã chọn tất cả" : "Chọn người phụ trách"}</option>
        {available.map((user) => <option value={user.id} key={user.id}>{user.name} — {ROLE_LABELS[user.role]} ({user.id.slice(-6)})</option>)}
      </select>
    </label>
    {error && <div role="alert"><small>{error}</small> <button type="button" className="button secondary compact" onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !users.length && <small>Quản trị viên cần cấp role Teaching Assistant hoặc Reserve Teaching Assistant cho tài khoản.</small>}
    <div className="name-chips">
      {selectedUsers.map((user) => <span key={user.id}>{user.name}{!loading && !error && !users.some((item) => item.id === user.id) && " (không còn trong danh sách)"}<button type="button" onClick={() => update(selectedUsers.filter((item) => item.id !== user.id))} aria-label={`Bỏ ${user.name}`}><X size={12} /></button></span>)}
      {legacy.map((name, index) => <span key={`legacy-${index}`}>{name} (dữ liệu cũ)<button type="button" onClick={() => update(selectedUsers, legacy.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Bỏ ${name}`}><X size={12} /></button></span>)}
    </div>
  </div>;
}