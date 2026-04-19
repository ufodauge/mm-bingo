export type TaskVersion = "v20260208" | "v20260409" | "v20260419";

export const taskVersions = [
  "v20260208",
  "v20260409",
  "v20260419",
] as const satisfies TaskVersion[];

export const latestTaskVersion = taskVersions[taskVersions.length - 1];

export const isTaskVersion = (value: string): value is TaskVersion =>
  taskVersions.includes(value as TaskVersion);
