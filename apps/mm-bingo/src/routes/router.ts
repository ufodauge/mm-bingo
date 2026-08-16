import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "../i18n";
import { setTasksBaseUrl } from "../libs/tasks/index";

// The task loader defaults to resolving tasks/ against its own module URL,
// which is correct for the standalone dist/task.js library build but not for
// this app — its chunks are emitted under assets/, one level deeper.
//
// vite.config.ts sets `base` differently per environment (dev: "/", build:
// "/mm-bingo" — deliberately no trailing slash there, see its own comment)
// and BASE_URL just reflects that raw value back, trailing slash or not.
// Stripping any trailing slash before adding exactly one back is what makes
// this work under both: naively concatenating a literal "/" here produced
// "//tasks/..." in dev (a leading "//" is a protocol-relative URL, not a
// path, so fetch tried to hit host "tasks" instead of the dev server), while
// dropping that "/" entirely to match dev broke the build, where BASE_URL
// has no trailing slash of its own ("/mm-bingotasks/...").
setTasksBaseUrl(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/tasks/`);

export const router = (tsx: ReactNode) => {
  createRoot(document.getElementById("root")!).render(tsx);
};
