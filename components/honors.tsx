"use client";

import { Trophy } from "lucide-react";
import { useState } from "react";
import type { Student } from "@/data/students";
import { useStaff } from "@/components/staff-provider";
import { getHonoredStudents, getHonoredSupporters } from "@/lib/honors";
import { getInstructorRanking, isValidRecordedDate } from "@/lib/honor-ranking";
import { formatStudentDate, toDateInput } from "@/lib/student-dates";

export default function Honors({ students, loading, error, onSelect }: {
  students: Student[]; loading: boolean; error: string; onSelect: (student: Student) => void;
}) {
  const { users, loading: staffLoading, error: staffError, reload } = useStaff();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(() => toDateInput().slice(0, 4));
  const [month, setMonth] = useState(() => toDateInput().slice(5, 7));
  const honored = getHonoredStudents(students);
  const ranking = getInstructorRanking(students, users, year, period === "month" ? month : undefined);
  const missingDates = honored.filter((student) => !isValidRecordedDate(student.passedRecordedDate));
  const entries = honored.map((student) => ({ student, supporters: getHonoredSupporters(student, users) }));
  const search = query.trim().toLocaleLowerCase("vi");
  const visible = entries.filter(({ student, supporters }) => `${student.name} ${supporters.map((person) => person.name).join(" ")}`.toLocaleLowerCase("vi").includes(search));

  return <section className="honors-section" aria-labelledby="honors-title">
    <div className="honors-heading"><Trophy size={32} /><div><h1 id="honors-title">Vinh danh học viên thi đậu</h1><p>Chúc mừng thành công của học viên và tri ân tất cả những người đã đồng hành.</p></div></div>
    <div className="table-search"><input aria-label="Tìm kiếm vinh danh" placeholder="Tìm học viên hoặc người hỗ trợ..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    {staffLoading && <p role="status">Đang xác định vai trò đội ngũ hỗ trợ...</p>}
    {staffError && <p role="alert">{staffError} Tên đã lưu vẫn được hiển thị. <button className="text-button" onClick={reload}>Thử lại</button></p>}
    <p>Vai trò được đối chiếu theo danh sách nhân sự hiện tại; lịch sử có lưu trong báo cáo tuần cũng được ghi nhận.</p>
    {loading ? <div className="empty-state" role="status">Đang tải danh sách vinh danh...</div>
      : error ? <div className="empty-state" role="alert">Không thể tải danh sách vinh danh. {error}</div>
      : <>
        <section className="honors-card" aria-labelledby="ranking-title">
          <h2 id="ranking-title">Xếp hạng giảng viên</h2>
          <div className="form-grid form-grid-3">
            <label className="form-field"><span>Thống kê theo</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="month">Theo tháng</option><option value="year">Theo năm</option></select></label>
            <label className="form-field"><span>Năm</span><input type="number" min="1000" max="9999" value={year} onChange={(event) => setYear(event.target.value)} /></label>
            {period === "month" && <label className="form-field"><span>Tháng</span><select value={month} onChange={(event) => setMonth(event.target.value)}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={String(index + 1).padStart(2, "0")}>Tháng {index + 1}</option>)}</select></label>}
          </div>
          <p>Tính theo ngày ghi nhận trạng thái thi đậu. Mỗi học viên tính một lần cho mỗi giảng viên phụ trách; cùng số lượng thì đồng hạng. Bộ lọc tìm kiếm bên trên không thay đổi xếp hạng.</p>
          {missingDates.length > 0 && <details><summary>{missingDates.length} học viên thi đậu chưa có ngày ghi nhận hợp lệ — chưa tính xếp hạng</summary><ul>{missingDates.map((student) => <li key={student.id}><button className="text-button" onClick={() => onSelect(student)}>{student.name} — mở hồ sơ để bổ sung</button></li>)}</ul></details>}
          {ranking.length ? <div className="table-wrap"><table><caption>Xếp hạng {period === "month" ? `tháng ${month}/` : "năm "}{year}</caption><thead><tr><th>Hạng</th><th>Giảng viên</th><th>Học viên thi đậu</th></tr></thead><tbody>{ranking.map((person) => <tr key={person.key}><td><strong>#{person.rank}</strong></td><td>{person.name}</td><td><details><summary>{person.count} học viên</summary><ul>{person.students.map((student) => <li key={student.id}><button className="text-button" onClick={() => onSelect(student)}>{student.name}</button></li>)}</ul></details></td></tr>)}</tbody></table></div>
            : <p role="status">Chưa có dữ liệu giảng viên có học viên thi đậu trong kỳ đã chọn.</p>}
          <p>Phân công giảng viên lấy từ hồ sơ hiện tại. Tên cũ không có ID được gộp theo tên; nên liên kết tài khoản để tránh nhầm người trùng tên.</p>
        </section>
        <p><strong>{honored.length}</strong> học viên thi đậu · Hiển thị {visible.length}</p>
        <div className="honors-grid">{visible.map(({ student, supporters }) => <article className="honors-card" key={student.id}>
          <span className="status success"><Trophy size={16} />Đã thi đậu</span>
          <h2>{student.name}</h2>
          <p>Ngày ghi nhận: {isValidRecordedDate(student.passedRecordedDate) ? formatStudentDate(student.passedRecordedDate) : "Chưa bổ sung"}</p>
          <h3>Đội ngũ đồng hành</h3>
          {supporters.length ? <ul>{supporters.map((person) => <li key={person.key}><strong>{person.name}</strong><span>{person.roles.join(" · ")}</span></li>)}</ul> : <p>Chưa có thông tin người hỗ trợ được lưu.</p>}
          <button className="text-button" onClick={() => onSelect(student)}>Xem hồ sơ học viên</button>
        </article>)}</div>
        {!visible.length && <div className="empty-state">{honored.length ? "Không tìm thấy học viên hoặc người hỗ trợ phù hợp." : "Chưa có học viên được ghi nhận thi đậu. Cập nhật trạng thái học viên thành “Đã thi đậu” để vinh danh."}</div>}
      </>}
  </section>;
}