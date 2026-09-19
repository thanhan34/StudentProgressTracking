import type { TaskNotes, WeeklyReport } from "@/data/students";
import { EXAM_LABELS, HOMEWORK_LABELS } from "@/lib/student-tracking";

function hasTaskNotes(task: TaskNotes) {
  return Boolean(task.assignees?.some((name) => name.trim()) || task.progressText?.trim() || task.limitations?.trim());
}

export function TaskNotesDetails({ task }: { task: TaskNotes }) {
  const assignees = task.assignees?.map((name) => name.trim()).filter(Boolean).join(", ");
  if (!hasTaskNotes(task)) return null;

  return <dl className="tracking-details">
    {assignees && <div><dt>Phụ trách</dt><dd>{assignees}</dd></div>}
    {task.progressText?.trim() && <div><dt>Tiến độ</dt><dd>{task.progressText}</dd></div>}
    {task.limitations?.trim() && <div><dt>Hạn chế</dt><dd>{task.limitations}</dd></div>}
  </dl>;
}

export function WeeklyTrackingDetails({ report }: { report: WeeklyReport }) {
  return <div className="weekly-tracking-details">
    <dl className="tracking-details">
      <div><dt>Vắng có phép</dt><dd>{report.excusedAbsences == null ? "Chưa ghi nhận" : `${report.excusedAbsences} buổi`}</dd></div>
      <div><dt>Vắng không phép</dt><dd>{report.unexcusedAbsences == null ? "Chưa ghi nhận" : `${report.unexcusedAbsences} buổi`}</dd></div>
      <div><dt>Bài tập về nhà</dt><dd>{HOMEWORK_LABELS[report.homeworkStatus ?? "not_recorded"]}</dd></div>
      <div><dt>Đánh giá thi</dt><dd>{EXAM_LABELS[report.examRecommendation ?? "not_assessed"]}</dd></div>
      <div><dt>Hạn chế trong tuần</dt><dd>{report.limitations || "Chưa ghi nhận"}</dd></div>
    </dl>
    {report.taskResults?.filter(hasTaskNotes).map((task) => <details key={task.code}><summary>Tiến độ {task.code} trong tuần</summary><TaskNotesDetails task={task} /></details>)}
  </div>;
}