import { useAtomValue, useSetAtom } from "jotai";
import { createPortal } from "react-dom";

import {
  dismissNotificationAtom,
  notificationsAtom,
} from "./store/notifications";

// Portaled to document.body for the same reason as RoomStatsDrawer: a
// plain `position: fixed` element only stacks correctly against the whole
// page, not just its React parent, once something between it and <body>
// (Header's `sticky z-10`, here) creates its own stacking context.
export const NotificationToasts = () => {
  const notifications = useAtomValue(notificationsAtom);
  const dismiss = useSetAtom(dismissNotificationAtom);

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="toast toast-top toast-center z-50">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          className="alert alert-info shadow-lg"
          onClick={() => dismiss(notification.id)}
        >
          <span>{notification.message}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
};
