import { atom } from "jotai";
import { queryParamsAtom } from "./queryParams";
import type { TaskVersion } from "./versions/taskVersion";

export const taskVersionAtom = atom(
  (get) => get(queryParamsAtom).version,
  (get, set, version: TaskVersion) => {
    const status = structuredClone(get(queryParamsAtom));
    status.version = version;
    set(queryParamsAtom, status);
  },
);
