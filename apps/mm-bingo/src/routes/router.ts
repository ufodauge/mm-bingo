import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';

export const router = (tsx: ReactNode) => {
  createRoot(document.getElementById('root')!).render(tsx);
};
