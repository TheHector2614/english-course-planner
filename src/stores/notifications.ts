import { atom } from "nanostores";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export const activeNotification = atom<Notification | null>(null);

export function showNotification(
  message: string,
  type: Notification["type"] = "info",
  duration = 4000
) {
  const id = Math.random().toString(36).substring(2, 9);
  activeNotification.set({ id, message, type, duration });

  if (duration > 0) {
    setTimeout(() => {
      const current = activeNotification.get();
      if (current && current.id === id) {
        activeNotification.set(null);
      }
    }, duration);
  }
}

export function dismissNotification() {
  activeNotification.set(null);
}
