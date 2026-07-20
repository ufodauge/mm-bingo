import { atom } from "jotai";

export type Notification = {
  id: string;
  message: string;
};

// In-memory only (not persisted) — a notification is about something that
// just happened in *this* window, not state to restore on reload. Kept
// generic (just a message, no "kind"/room-specific fields) so any future
// caller can reuse pushNotificationAtom without this file needing to know
// about them.
export const notificationsAtom = atom<Notification[]>([]);

const NOTIFICATION_DURATION_MS = 5000;

export const pushNotificationAtom = atom(null, (_get, set, message: string) => {
  const id = crypto.randomUUID();
  set(notificationsAtom, (prev) => [...prev, { id, message }]);
  setTimeout(() => {
    set(notificationsAtom, (prev) => prev.filter((n) => n.id !== id));
  }, NOTIFICATION_DURATION_MS);
});

export const dismissNotificationAtom = atom(null, (_get, set, id: string) => {
  set(notificationsAtom, (prev) => prev.filter((n) => n.id !== id));
});
