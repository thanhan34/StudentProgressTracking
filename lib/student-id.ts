export function generateStudentId(): string {
  return `PTE-${crypto.randomUUID().toUpperCase()}`;
}