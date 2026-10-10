"use client";

import { WeeklyTrackingDetails } from "@/components/tracking-details";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";

import {
  AlertTriangle, BarChart3, Bell, BookOpenCheck, CalendarClock, CalendarDays,
  ChevronRight, CircleHelp, ClipboardList, Copy, Download,
  LayoutDashboard, Menu, Pencil, Search, Settings, UserCheck,
  Target, Trash2, UserPlus, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import brandLogo from "@/images/logo/white-logo.png";
import {
  STUDENT_STATUSES, type Student,
  type StudentStatus,
} from "@/data/students";
import { InlineExamDate, InlineExamRecommenders, InlineStudentStatus, InlineSupportTeam, InlineTaskProgress, InlineWeeklyLimitations } from "@/components/student-inline-fields";
import type { StudentInlineChange } from "@/lib/student-inline";
import StudentForm from "@/components/student-form";
import { StudentTagEditor, StudentTags } from "@/components/ui/student-tags";
import { STUDENT_TAGS, normalizeStudentTags, type StudentTag } from "@/data/students";
import Honors from "@/components/honors";
import StudentStatusFilter from "@/components/student-status-filter";
import { DEFAULT_STUDENT_STATUSES, matchesStudentStatus } from "@/lib/student-status-filter";
import TaskManager from "@/components/task-manager";
import WeeklyUpdateForm from "@/components/weekly-update-form";
import { useStudents } from "@/hooks/use-students";
import AuthControls from "@/components/auth-controls";
import { useStaff } from "@/components/staff-provider";
import { ROLE_LABELS } from "@/lib/roles";
import { matchesStudentAssignee } from "@/lib/student-assignment";
import { sortStudentsByExam } from "@/lib/student-sorting";
import { buildExamCopyText } from "@/lib/exam-copy";
import { formatStudentDate as formatDate, daysUntilExam, isUpcomingExam, examCountdown } from "@/lib/student-dates";

const navItems = [
  { label: "Tổng quan", icon: LayoutDashboard },
  { label: "Học viên PTE", icon: Users },
  { label: "Vinh danh", icon: UserCheck },
  { label: "PTE Tasks", icon: BookOpenCheck },
  { label: "Báo cáo tuần", icon: ClipboardList },
  { label: "Lịch thi", icon: CalendarDays },
];

const statusStyle: Record<StudentStatus, string> = {
  "Đã đăng ký thi": "status exam",
  "Đã thi đậu": "status success",
  "Đang học": "status success",
  "Bảo Lưu": "status warning",
  "Bỏ học": "status neutral",
};

const skillColors = { Speaking: "#fc5d01", Writing: "#fd7f33", Reading: "#e85200", Listening: "#ff8a47" };

export default function Dashboard({ currentUserId, initialAssigneeFilter }: { currentUserId: string; initialAssigneeFilter: string }) {
  const { users: staff, loading: staffLoading, error: staffError, reload: reloadStaff } = useStaff();
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssigneeFilter);
  const { studentList, isLoading, storageError, saveStudent, saveStudentTags, saveStudentInline, removeStudent } = useStudents();
  const upcomingExams = studentList.filter((student) => isUpcomingExam(student.examDate));
  const reservedStudents = studentList.filter((student) => student.status === "Bảo Lưu");
  const studyingStudents = studentList.filter((student) => student.status === "Đang học" || student.status === "Đã đăng ký thi");
  const reports = studentList.flatMap((student) => student.weeklyReports);
  const averageScore = studentList.length ? (studentList.reduce((sum, student) => sum + student.currentScore, 0) / studentList.length).toFixed(1) : "—";
  const allTasks = studentList.flatMap((student) => student.tasks);
  const pteTaskOverview = Array.from(new Set(allTasks.map((task) => task.code))).map((code) => {
    const tasks = allTasks.filter((task) => task.code === code);
    return { ...tasks[0], average: Math.round(tasks.reduce((sum, task) => sum + task.score, 0) / tasks.length), color: skillColors[tasks[0].skill] };
  });
  const metricValue = (value: string) => isLoading ? "…" : storageError ? "—" : value;
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("Tất cả giai đoạn");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus[]>(() => [...DEFAULT_STUDENT_STATUSES]);
  const [activeNav, setActiveNav] = useState("Tổng quan");
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null | undefined>(undefined);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [weeklyUpdate, setWeeklyUpdate] = useState<{ student: Student; reportIndex?: number } | null>(null);
  const [managingTasks, setManagingTasks] = useState<Student | null>(null);
  const [copyingExams, setCopyingExams] = useState(false);
  const [examCopyFeedback, setExamCopyFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return sortStudentsByExam(studentList.filter((student) => {
      const searchable = `${student.name} ${student.instructors.join(" ")} ${student.teachingAssistants.join(" ")} ${student.tasks.map((task) => task.code).join(" ")}`.toLocaleLowerCase("vi");
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && matchesStudentAssignee(student, assigneeFilter)
        && (!tagFilter || normalizeStudentTags(student.tags).some((tag) => tag === tagFilter))
        && (phaseFilter === "Tất cả giai đoạn" || student.phase === phaseFilter)
        && matchesStudentStatus(student.status, statusFilter);
    }));
  }, [phaseFilter, query, statusFilter, studentList, assigneeFilter, tagFilter]);
  const selectedIndex = filteredStudents.findIndex((student) => student.id === selectedStudent?.id);
  const examCopyText = buildExamCopyText(filteredStudents);
  const copyExamSchedule = async () => {
    if (!examCopyText || copyingExams) return;
    setCopyingExams(true);
    setExamCopyFeedback(null);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(examCopyText);
      setExamCopyFeedback({ text: "Đã copy lịch thi của học viên đang hiển thị. Bạn có thể dán vào tin nhắn hoặc ghi chú.", error: false });
    } catch {
      setExamCopyFeedback({ text: "Không thể copy. Vui lòng mở ứng dụng qua HTTPS hoặc localhost, cho phép truy cập clipboard rồi thử lại.", error: true });
    } finally {
      setCopyingExams(false);
    }
  };
  const nextStudent = selectedIndex >= 0 ? filteredStudents[selectedIndex + 1] : undefined;

  const exportCsv = () => {
    const rows = [
      ["Họ tên", "Giảng viên", "Trợ giảng", "Ngày bắt đầu", "Ngày thi dự kiến", "Giai đoạn", "Điểm hiện tại", "Mục tiêu", "Chuyên cần", "Task yếu", "Trạng thái", "Tag", "Người đề xuất đi thi"],
      ...filteredStudents.map((student) => [student.name, supportNames(student.instructors, "; "), supportNames(student.teachingAssistants, "; "), formatDate(student.startDate), formatDate(student.examDate), student.phase, student.currentScore, student.targetScore, `${student.attendance}%`, weakestTask(student)?.code ?? "Chưa có", student.status, normalizeStudentTags(student.tags).join("; "), (student.examRecommenders ?? []).join("; ")]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")}`;
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    anchor.download = "tien-do-hoc-vien-pte.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const resetFilters = () => { setQuery(""); setPhaseFilter("Tất cả giai đoạn"); setStatusFilter([...STUDENT_STATUSES]); setAssigneeFilter(""); setTagFilter(""); };

  const handleSave = async (student: Student) => {
    await saveStudent(student);
    setEditingStudent(undefined);
    setSelectedStudent((current) => current?.id === student.id ? student : current);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    await removeStudent(deletingStudent.id);
    setSelectedStudent((current) => current?.id === deletingStudent.id ? null : current);
    setDeletingStudent(null);
  };

  const handleInlineSave = async (studentId: string, change: StudentInlineChange) => {
    const patch = await saveStudentInline(studentId, change);
    setSelectedStudent((current) => current?.id === studentId ? { ...current, ...patch } : current);
  };

  const handleTagSave = async (studentId: string, tags: StudentTag[]) => {
    await saveStudentTags(studentId, tags);
    setSelectedStudent((current) => current?.id === studentId ? { ...current, tags } : current);
  };

  const handleWeeklySave = async (student: Student) => {
    await saveStudent(student);
    setWeeklyUpdate(null);
    setSelectedStudent((current) => current?.id === student.id ? student : current);
  };

  const handleTaskSave = async (student: Student) => {
    await saveStudent(student);
    setManagingTasks(student);
    setSelectedStudent((current) => current?.id === student.id ? student : current);
  };

  return (
    <div className="app-shell dashboard-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><Image src={brandLogo} alt="PTE Intensive" className="brand-logo" priority sizes="140px" /></div>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X /></button>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <p className="nav-title">QUẢN LÝ PTE</p>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} aria-current={activeNav === label ? "page" : undefined} className={activeNav === label ? "active" : ""} onClick={() => { setActiveNav(label); setMenuOpen(false); }}>
              <Icon size={19} /><span>{label}</span>{label === "Học viên PTE" && <span className="nav-count">{studentList.length}</span>}
            </button>
          ))}
          <p className="nav-title secondary-title">HỆ THỐNG</p>
          <button><Settings size={19} /><span>Cài đặt</span></button>
          <button><CircleHelp size={19} /><span>Trợ giúp</span></button>
        </nav>
        <div className="upgrade-card"><span className="upgrade-icon"><Target size={20} /></span><strong>Tình hình học viên</strong><p>{isLoading ? "Đang tải..." : storageError ? "Chưa tải được dữ liệu." : `${upcomingExams.length} học viên sắp thi và ${reservedStudents.length} học viên bảo lưu.`}</p><button onClick={() => setStatusFilter(["Bảo Lưu"])}>Xem học viên bảo lưu</button></div>
        <div className="sidebar-profile"><AuthControls /></div>
      </aside>
      {menuOpen && <button className="backdrop" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Mở menu"><Menu /></button>
          <div className="global-search"><Search size={19} /><Input aria-label="Tìm học viên hoặc task PTE" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm học viên hoặc task PTE..." /></div>
          <div className="topbar-actions"><button className="icon-button notice-button" onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Thông báo" aria-expanded={noticeOpen}><Bell size={20} />{!isLoading && !storageError && upcomingExams.length > 0 && <span />}</button><AuthControls /></div>
          {noticeOpen && <div className="notice-popover"><strong>Thông báo PTE</strong>{isLoading ? <p>Đang tải...</p> : storageError ? <p>Chưa tải được dữ liệu.</p> : upcomingExams.length ? upcomingExams.map((student) => <p key={student.id}>{student.name}: còn {daysUntilExam(student.examDate)} ngày đến kỳ thi.</p>) : <p>Không có lịch thi trong 30 ngày tới.</p>}</div>}
        </header>

        <div className="page-content">
          {activeNav === "Vinh danh" ? <Honors students={studentList} loading={isLoading} error={storageError} onSelect={setSelectedStudent} /> : <>
          <section className="welcome-row">
            <div><h1>Tổng quan lớp PTE</h1><p>Theo dõi lịch thi, điểm số và kết quả luyện task hằng tuần.</p><div className="dashboard-date"><CalendarDays size={16} aria-hidden="true" /><span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}</span></div></div>
            <div className="welcome-actions"><Button onClick={exportCsv} disabled={isLoading || !!storageError || !filteredStudents.length}><Download size={18} />Xuất báo cáo</Button><Button variant="primary" onClick={() => setEditingStudent(null)}><UserPlus size={18} />Thêm học viên</Button></div>
          </section>

          {storageError && <div className="storage-error" role="alert"><AlertTriangle size={18} />{storageError}</div>}

          <section className="metrics-grid" aria-label="Chỉ số PTE tổng quan">
            <MetricCard icon={Users} color="purple" label="Học viên đang học" value={metricValue(String(studyingStudents.length))} detail="Đang học hoặc đã đăng ký thi" />
            <MetricCard icon={CalendarClock} color="blue" label="Sắp thi trong 30 ngày" value={metricValue(String(upcomingExams.length))} detail="Theo ngày thi dự kiến" />
            <MetricCard icon={BarChart3} color="green" label="Điểm PTE trung bình" value={metricValue(averageScore)} detail="Theo điểm hiện tại" />
            <MetricCard icon={AlertTriangle} color="orange" label="Học viên bảo lưu" value={metricValue(String(reservedStudents.length))} detail="Theo trạng thái đã lưu" />
          </section>

          <section className="charts-grid">
            <Card className="activity-card">
              <CardHeader title="Tổng hợp báo cáo học tập" subtitle="Tất cả báo cáo tuần đã lưu" action={null} />
              {isLoading || storageError || !reports.length ? <p className="no-week-data">{isLoading ? "Đang tải báo cáo..." : storageError ? "Chưa tải được báo cáo." : "Chưa có báo cáo tuần."}</p> : <div className="chart-summary"><div><p><small>Báo cáo đã lưu</small><strong>{reports.length}</strong></p></div><div><p><small>Tổng task hoàn thành</small><strong>{reports.reduce((sum, report) => sum + report.tasksCompleted, 0)}</strong></p></div><div><p><small>Điểm mock trung bình</small><strong>{(reports.reduce((sum, report) => sum + report.mockScore, 0) / reports.length).toFixed(1)}</strong></p></div></div>}
              <div className="report-context"><ClipboardList size={20} aria-hidden="true" /><p>Tổng hợp từ các báo cáo tuần đã lưu của toàn bộ học viên, không chỉ riêng tuần gần nhất.</p></div>
            </Card>

            <Card className="course-card">
              <CardHeader title="Hiệu suất PTE Tasks" subtitle="Điểm trung bình các task trọng yếu" action={<button className="text-button" onClick={() => setActiveNav("PTE Tasks")}>Chi tiết <ChevronRight size={16} /></button>} />
              {(isLoading || storageError || !pteTaskOverview.length) && <p className="no-week-data">{isLoading ? "Đang tải tasks..." : storageError ? "Chưa tải được tasks." : "Chưa có dữ liệu task."}</p>}
              <div className="course-list">{pteTaskOverview.map((task) => <div className="course-item" key={task.code}><div className="course-heading"><span className="task-code" style={{ color: task.color, background: `${task.color}14` }}>{task.code}</span><div><strong>{task.name}</strong><small>{task.skill}</small></div><b>{task.average}/90</b></div><div className="progress-track"><span style={{ width: `${task.average / .9}%`, background: task.color }} /></div></div>)}</div>
            </Card>
          </section>

          <section className="card students-card">
            <CardHeader title="Tiến độ học viên PTE" subtitle="Học viên, ngày đăng ký thi, điểm mục tiêu và trạng thái hiện tại" action={<div className="student-table-actions"><Button onClick={copyExamSchedule} disabled={isLoading || !!storageError || !examCopyText || copyingExams} title="Copy học viên đang hiển thị có ngày đăng ký thi, nhóm theo ngày"><Copy size={16} aria-hidden="true" />{copyingExams ? "Đang copy…" : "Copy lịch thi"}</Button><button className="text-button" onClick={resetFilters}>Xem tất cả <ChevronRight size={16} /></button></div>} />
            {examCopyFeedback && <p className="exam-copy-feedback" role={examCopyFeedback.error ? "alert" : "status"}>{examCopyFeedback.text}</p>}
            <div className="student-list-scope"><Tabs label="Phạm vi người phụ trách" options={[{ value: "", label: "Tất cả học viên" }, { value: currentUserId, label: "Tôi phụ trách" }]} value={assigneeFilter} onChange={setAssigneeFilter} /><span className="student-result-count" role="status">{isLoading ? "Đang tải dữ liệu…" : storageError ? "Chưa tải được dữ liệu" : `${filteredStudents.length} học viên phù hợp`}</span></div>
            <div className="table-tools">
              <div className="table-search"><Search size={17} /><Input aria-label="Tìm học viên, giảng viên hoặc trợ giảng" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Học viên, giảng viên, trợ giảng..." />{query && <button onClick={() => setQuery("")} aria-label="Xóa tìm kiếm"><X size={15} /></button>}</div>
              <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)} aria-label="Lọc theo giai đoạn"><option>Tất cả giai đoạn</option><option>Nền tảng</option><option>Luyện task</option><option>Mock test</option><option>Nước rút</option></select>
              <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} aria-label="Lọc theo người phụ trách">
                <option value="">Tất cả người phụ trách</option>
                <option value={currentUserId}>Tôi phụ trách</option>
                {staff.filter((user) => user.id !== currentUserId).map((user) => <option key={user.id} value={user.id}>{user.name} — {ROLE_LABELS[user.role]} ({user.id.slice(-6)})</option>)}
                {staffLoading && <option disabled>Đang tải người phụ trách...</option>}
              </select>
              <StudentStatusFilter selected={statusFilter} onChange={setStatusFilter} />
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Lọc theo tag"><option value="">Tất cả tag</option>{STUDENT_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select>
            </div>
            <div className="table-wrapper"><table className="pte-table"><thead><tr><th>HỌC VIÊN</th><th>NGÀY ĐĂNG KÝ THI</th><th>TARGET PTE</th><th>TRẠNG THÁI</th><th>NGƯỜI ĐỀ XUẤT ĐI THI</th><th>HẠN CHẾ CỦA HỌC VIÊN</th><th /></tr></thead>
              <tbody>{filteredStudents.map((student) => { return <tr key={student.id} onClick={() => setSelectedStudent(student)}><td><div className="student-cell"><span className="student-avatar" style={{ background: `${student.color}18`, color: student.color }}>{student.initials}</span><div><button type="button" className="student-profile-link" onClick={(event) => { event.stopPropagation(); setSelectedStudent(student); }}>{student.name}</button><small>{student.phase}</small><span className="support-summary">GV: {supportNames(student.instructors)} · TG: {supportNames(student.teachingAssistants)}</span></div></div></td><td><strong className="date-value">{formatDate(student.examDate)}</strong><small className={isUpcomingExam(student.examDate) ? "exam-soon" : ""}>{examCountdown(student.examDate)}</small></td><td className="student-target-cell"><strong>{student.targetScore}</strong><span> / 90</span></td><td><span className={statusStyle[student.status]}><i />{student.status}</span><StudentTags tags={student.tags} /></td><td className="exam-recommenders-cell">{student.examRecommenders?.length ? student.examRecommenders.join(", ") : "Chưa ghi nhận"}</td><td className="student-limitations-cell"><p>{student.weeklyLimitations?.trim() || "—"}</p></td><td><div className="row-actions"><button className="tasks" onClick={(event) => { event.stopPropagation(); setManagingTasks(student); }} aria-label={`Quản lý tasks của ${student.name}`} title="Quản lý tasks"><BookOpenCheck size={15} /></button><button className="weekly" onClick={(event) => { event.stopPropagation(); setWeeklyUpdate({ student }); }} aria-label={`Cập nhật tuần cho ${student.name}`} title="Cập nhật tuần"><ClipboardList size={15} /></button><button className="edit" onClick={(event) => { event.stopPropagation(); setEditingStudent(student); }} aria-label={`Sửa ${student.name}`} title="Sửa"><Pencil size={15} /></button><button className="delete" onClick={(event) => { event.stopPropagation(); setDeletingStudent(student); }} aria-label={`Xóa ${student.name}`} title="Xóa"><Trash2 size={15} /></button></div></td></tr>; })}</tbody>
            </table>{isLoading ? <div className="empty-state"><strong>Đang tải học viên...</strong></div> : !filteredStudents.length && <div className="empty-state"><Search size={28} /><strong>{storageError ? "Không thể tải học viên" : studentList.length ? "Không tìm thấy học viên" : "Chưa có học viên"}</strong><p>{storageError ? "Kiểm tra kết nối và quyền Firebase rồi tải lại trang." : studentList.length ? "Hãy thử thay đổi bộ lọc." : "Nhấn Thêm học viên để bắt đầu."}</p></div>}</div>
            {staffError && <div className="assignment-filter-note" role="alert">{staffError} <button type="button" className="text-button" onClick={reloadStaff}>Thử lại</button></div>}
            <div className="table-footer"><span>Hiển thị {filteredStudents.length} trên {studentList.length} học viên PTE{assigneeFilter === currentUserId ? " · Tôi phụ trách" : ""}</span><span>Ưu tiên: có ngày đăng ký thi → Có thể thi được / Cần thi gấp → còn lại</span></div>
          </section>
          </>}
        </div>
      </main>

      <nav className="mobile-nav">{navItems.slice(0, 4).map(({ label, icon: Icon }) => <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}><Icon size={20} /><span>{label.replace(" PTE", "")}</span></button>)}</nav>
      {selectedStudent && <StudentDetail key={selectedStudent.id} onInlineSave={handleInlineSave} onTagSave={handleTagSave} student={selectedStudent} nextStudentName={nextStudent?.name} onNext={nextStudent ? () => setSelectedStudent(nextStudent) : undefined} onClose={() => setSelectedStudent(null)} onEdit={() => { setEditingStudent(selectedStudent); setSelectedStudent(null); }} onDelete={() => { setDeletingStudent(selectedStudent); setSelectedStudent(null); }} onManageTasks={() => { setManagingTasks(selectedStudent); setSelectedStudent(null); }} onWeeklyUpdate={(reportIndex) => { setWeeklyUpdate({ student: selectedStudent, reportIndex }); setSelectedStudent(null); }} />}
      {editingStudent !== undefined && <StudentForm student={editingStudent} existingIds={studentList.map((student) => student.id)} onCancel={() => setEditingStudent(undefined)} onSave={handleSave} />}
      {deletingStudent && <DeleteConfirmation student={deletingStudent} onCancel={() => setDeletingStudent(null)} onConfirm={handleDelete} />}
      {weeklyUpdate && <WeeklyUpdateForm student={weeklyUpdate.student} reportIndex={weeklyUpdate.reportIndex} onCancel={() => setWeeklyUpdate(null)} onSave={handleWeeklySave} />}
      {managingTasks && <TaskManager student={managingTasks} onClose={() => setManagingTasks(null)} onSave={handleTaskSave} />}
    </div>
  );
}

function StudentDetail({ student, nextStudentName, onNext: next, onClose: close, onEdit: edit, onDelete: remove, onManageTasks: manage, onWeeklyUpdate: weekly, onTagSave, onInlineSave }: { onInlineSave: (studentId: string, change: StudentInlineChange) => Promise<void>; student: Student; nextStudentName?: string; onNext?: () => void; onClose: () => void; onEdit: () => void; onDelete: () => void; onManageTasks: () => void; onWeeklyUpdate: (reportIndex?: number) => void; onTagSave: (studentId: string, tags: StudentTag[]) => Promise<void> }) {
  const article = useRef<HTMLElement>(null);
  const [navigationError, setNavigationError] = useState("");
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    article.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  const navigate = (action: () => void) => {
    if (article.current?.querySelector('[data-unsaved="true"], [aria-busy="true"]')) {
      setNavigationError("Có thông tin chưa lưu hoặc đang lưu. Vui lòng chờ lưu xong hoặc xử lý lỗi trước khi rời hồ sơ.");
      return;
    }
    setNavigationError("");
    action();
  };
  const onClose = () => navigate(close);
  const onEdit = () => navigate(edit);
  const onDelete = () => navigate(remove);
  const onManageTasks = () => navigate(manage);
  const onWeeklyUpdate = (index?: number) => navigate(() => weekly(index));
  const onNext = next ? () => navigate(next) : undefined;
  return <div className="modal-backdrop student-detail-backdrop" onClick={onClose}><article ref={article} className="student-modal pte-modal student-detail" role="dialog" aria-modal="true" aria-labelledby="student-detail-name" tabIndex={-1} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => {
    if (event.key === "Escape") {
      // Let nested status dropdowns handle their own Escape first.
      if (event.defaultPrevented || article.current?.querySelector("details[open]")) return;
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(article.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, a[href], [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length && !element.closest("fieldset:disabled"));
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === article.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>
    {navigationError && <p className="inline-navigation-error" role="alert">{navigationError}</p>}
    <button className="modal-close" onClick={onClose} aria-label="Đóng chi tiết học viên"><X /></button>
    <header className="profile-header"><div className="modal-avatar" aria-hidden="true">{student.initials}</div><div><h2 id="student-detail-name">{student.name}</h2><div className="profile-meta"><span>{student.phase}</span><span className={statusStyle[student.status]}><i />{student.status}</span></div></div></header>
    <div className="profile-summary" aria-label="Tóm tắt hồ sơ"><div><span>Điểm hiện tại</span><strong>{student.currentScore}<small> / 90</small></strong></div><div><span>Mục tiêu PTE</span><strong>{student.targetScore}<small> / 90</small></strong></div><div><span>Chuyên cần</span><strong>{student.attendance}<small>%</small></strong></div><div className="profile-exam-summary"><CalendarClock size={20} aria-hidden="true" /><span>Kỳ thi dự kiến<strong>{examCountdown(student.examDate)}</strong></span></div></div>
    <p className="profile-save-note">Thông tin được tự lưu khi rời ô nhập; trạng thái và phân công tự lưu khi chọn. Chờ thông báo “Đã lưu” trước khi rời hồ sơ.</p>
    <section className="detail-section student-status-section" aria-labelledby="student-status-heading">
      <div className="section-heading"><h3 id="student-status-heading">Tình trạng học viên</h3><button className="small-add-button" onClick={onEdit}><Pencil size={14} />Sửa thông tin</button></div>
      <div className="profile-status-grid">
      <InlineStudentStatus key={`status-${student.id}`} student={student} onSave={(change) => onInlineSave(student.id, change)} />
      <InlineExamRecommenders key={`recommenders-${student.id}`} student={student} onSave={(change) => onInlineSave(student.id, change)} />
      </div>
      <StudentTagEditor key={student.id} tags={student.tags} onSave={(tags) => onTagSave(student.id, tags)} />
      <InlineWeeklyLimitations key={`limitations-${student.id}`} student={student} onSave={(change) => onInlineSave(student.id, change)} />
    </section>
    <section className="detail-section profile-schedule"><div className="section-heading"><h3>Lộ trình và lịch thi</h3></div><div className="timeline-info"><div><CalendarDays size={20} aria-hidden="true" /><span>Bắt đầu học<strong>{formatDate(student.startDate)}</strong></span></div><div><CalendarClock size={20} aria-hidden="true" /><InlineExamDate student={student} onSave={(change) => onInlineSave(student.id, change)} /></div></div></section>
    <InlineSupportTeam student={student} onSave={(change) => onInlineSave(student.id, change)} />
    <section className="detail-section"><div className="section-heading"><h3>Tiến độ PTE Tasks</h3><button className="small-add-button" onClick={onManageTasks}><BookOpenCheck size={14} />Quản lý tasks</button></div><p className="inline-save-hint">Sửa trực tiếp; ô nhập tự lưu khi rời ô, phân công tự lưu khi chọn hoặc bỏ người.</p>{student.tasks.length ? <div className="inline-task-list">{student.tasks.map((task) => <InlineTaskProgress key={task.code} task={task} onSave={(change) => onInlineSave(student.id, change)} />)}</div> : <p className="no-week-data">Chưa có task. Nhấn “Quản lý tasks” để thêm task đầu tiên.</p>}</section>
    <section className="detail-section"><div className="section-heading"><h3>Tình hình học tập từng tuần</h3><button className="small-add-button" onClick={() => onWeeklyUpdate()}><ClipboardList size={14} />Cập nhật tuần</button></div>{student.weeklyReports.length ? <div className="weekly-report-list">{student.weeklyReports.toReversed().map((report, index) => { const originalIndex = student.weeklyReports.length - 1 - index; return <div className="week-report editable" key={`${report.week}-${originalIndex}`}><div className={`week-dot ${index === 0 ? "current" : ""}`} /><div className="week-title"><strong>{report.week}</strong><small>{report.dateRange}</small></div><div className="week-numbers"><span><b>{report.lessons}</b> buổi</span><span><b>{report.tasksCompleted}</b> task</span><span>Mock <b>{report.mockScore}</b></span><span>CC <b>{report.attendance}%</b></span></div><button className="week-edit" onClick={() => onWeeklyUpdate(originalIndex)} aria-label={`Sửa ${report.week}`} title={`Sửa ${report.week}`}><Pencil size={13} /></button><p>{report.note}</p><WeeklyTrackingDetails report={report} /></div>; })}</div> : <p className="no-week-data">Học viên mới chưa có báo cáo tuần. Nhấn “Cập nhật tuần” để thêm báo cáo đầu tiên.</p>}</section>
    <div className="detail-actions"><button className="button danger" onClick={onDelete}><Trash2 size={16} />Xóa học viên</button><button className="button secondary" onClick={onManageTasks}><BookOpenCheck size={16} />Quản lý tasks</button><button className="button secondary" onClick={onEdit}><Pencil size={16} />Sửa thông tin</button><button className="button primary" onClick={() => onWeeklyUpdate()}><ClipboardList size={16} />Cập nhật tuần</button><button type="button" className="button secondary next-student-button" onClick={onNext} disabled={!next} title={nextStudentName ? `Xem ${nextStudentName}` : "Đã đến cuối danh sách học viên"}>Học viên tiếp theo<ChevronRight size={16} /></button></div>
  </article></div>;
}

function DeleteConfirmation({ student, onCancel, onConfirm }: { student: Student; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const handleConfirm = async () => { setIsDeleting(true); setError(""); try { await onConfirm(); } catch { setError("Không thể xóa học viên. Vui lòng thử lại."); setIsDeleting(false); } };
  return <div className="modal-backdrop" onClick={onCancel}><article className="student-modal confirm-modal" onClick={(event) => event.stopPropagation()}><span className="confirm-icon"><Trash2 size={24} /></span><h2>Xóa học viên?</h2><p>Bạn có chắc muốn xóa <strong>{student.name}</strong>? Toàn bộ tiến độ task và báo cáo tuần của học viên sẽ bị xóa.</p>{error && <div className="form-error">{error}</div>}<div className="form-actions"><button className="button secondary" onClick={onCancel} disabled={isDeleting}>Hủy</button><button className="button danger solid" onClick={handleConfirm} disabled={isDeleting}><Trash2 size={16} />{isDeleting ? "Đang xóa..." : "Xóa học viên"}</button></div></article></div>;
}

function weakestTask(student: Student) { return [...student.tasks].sort((a, b) => (a.score - a.target) - (b.score - b.target))[0] ?? null; }
function supportNames(names: string[], separator = ", ") { return names.length ? names.join(separator) : "Chưa phân công"; }
function CardHeader({ title, subtitle, action }: { title: string; subtitle: string; action: React.ReactNode }) { return <div className="card-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>; }
function MetricCard({ icon: Icon, color, label, value, detail }: { icon: typeof Users; color: string; label: string; value: string; detail: string }) {
  return <Card className="metric-card"><div className="metric-heading"><div className={`metric-icon ${color}`}><Icon size={21} aria-hidden="true" /></div><div className="metric-label">{label}</div></div><strong className="metric-value">{value}</strong><div className="metric-change">{detail}</div></Card>;
}