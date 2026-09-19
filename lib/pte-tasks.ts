import type { PteSkill, TaskProgress } from "../data/students";

// PTE Academic question types; codes are the application's display identifiers.
export const pteTaskTemplates: Pick<TaskProgress, "code" | "name" | "skill">[] = [
  { code: "RA", name: "Read Aloud", skill: "Speaking" },
  { code: "RS", name: "Repeat Sentence", skill: "Speaking" },
  { code: "DI", name: "Describe Image", skill: "Speaking" },
  { code: "RL", name: "Re-tell Lecture", skill: "Speaking" },
  { code: "ASQ", name: "Answer Short Question", skill: "Speaking" },
  { code: "SGD", name: "Summarize Group Discussion", skill: "Speaking" },
  { code: "RTS", name: "Respond to a Situation", skill: "Speaking" },
  { code: "SWT", name: "Summarize Written Text", skill: "Writing" },
  { code: "WE", name: "Write Essay", skill: "Writing" },
  { code: "FIB-RW", name: "Reading & Writing: Fill in the Blanks", skill: "Reading" },
  { code: "R-MCMA", name: "Multiple Choice, Multiple Answers", skill: "Reading" },
  { code: "RO", name: "Re-order Paragraphs", skill: "Reading" },
  { code: "FIB-R", name: "Reading: Fill in the Blanks", skill: "Reading" },
  { code: "R-MCSA", name: "Multiple Choice, Single Answer", skill: "Reading" },
  { code: "SST", name: "Summarize Spoken Text", skill: "Listening" },
  { code: "L-MCMA", name: "Multiple Choice, Multiple Answers", skill: "Listening" },
  { code: "FIB-L", name: "Fill in the Blanks", skill: "Listening" },
  { code: "HCS", name: "Highlight Correct Summary", skill: "Listening" },
  { code: "L-MCSA", name: "Multiple Choice, Single Answer", skill: "Listening" },
  { code: "SMW", name: "Select Missing Word", skill: "Listening" },
  { code: "HIW", name: "Highlight Incorrect Words", skill: "Listening" },
  { code: "WFD", name: "Write From Dictation", skill: "Listening" },
];

export const defaultTaskCodes = ["DI", "RL", "SGD", "SWT", "HIW", "WFD"];
export const defaultTaskTarget = 90;

export function createDefaultTasks(skills: Record<PteSkill, number>, target = defaultTaskTarget): TaskProgress[] {
  return defaultTaskCodes.map((code) => {
    const template = pteTaskTemplates.find((task) => task.code === code)!;
    return { ...template, score: skills[template.skill], target, practiced: 0 };
  });
}

export function addMissingDefaultTasks(tasks: TaskProgress[], skills: Record<PteSkill, number>, target = defaultTaskTarget): TaskProgress[] {
  const existing = new Set(tasks.map((task) => task.code.toUpperCase()));
  return [...tasks, ...createDefaultTasks(skills, target).filter((task) => !existing.has(task.code))];
}