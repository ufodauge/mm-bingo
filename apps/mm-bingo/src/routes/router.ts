import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "../i18n";

export const router = (tsx: ReactNode) => {
  createRoot(document.getElementById("root")!).render(tsx);
};
