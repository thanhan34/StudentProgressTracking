import type { TaskNotes, WeeklyReport } from "@/data/students";
import { weeklyTrackingEntries } from "@/lib/student-tracking";

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
  const entries = weeklyTrackingEntries(report);
  const tasks = report.taskResults?.filter(hasTaskNotes) ?? [];
  if (!entries.length && !tasks.length) return null;
  return <div className="weekly-tracking-details">
    {entries.length > 0 && <dl className="tracking-details">
      {entries.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>}
    {tasks.map((task) => <details key={task.code}><summary>Tiến độ {task.code} trong tuần</summary><TaskNotesDetails task={task} /></details>)}
  </div>;
}