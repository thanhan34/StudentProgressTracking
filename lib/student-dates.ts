export function toDateInput(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function defaultWeekDates(today = new Date()) {
  const end = new Date(today);
  end.setDate(end.getDate() + 6);
  return { startDate: toDateInput(today), endDate: toDateInput(end) };
}

export function formatStudentDate(date?: string): string {
  if (!date) return "Chưa có lịch thi";
  const parsed = new Date(`${date}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return "Ngày không hợp lệ";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

export function daysUntilExam(date?: string, now = new Date()): number | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((parsed.getTime() - today.getTime()) / 86400000);
}

export function isUpcomingExam(date?: string, now = new Date()): boolean {
  const days = daysUntilExam(date, now);
  return days !== null && days >= 0 && days <= 30;
}

export function examCountdown(date?: string): string {
  const days = daysUntilExam(date);
  if (days === null) return "Chưa có lịch thi";
  if (days < 0) return "Đã qua ngày thi dự kiến";
  if (days === 0) return "Dự kiến thi hôm nay";
  return `Còn ${days} ngày`;
}