import { useStore } from "@nanostores/react";
import { activeNotification, dismissNotification } from "../../stores/notifications";

export default function NotificationBanner() {
  const notification = useStore(activeNotification);

  if (!notification) return null;

  const bgColors = {
    success: "color-mix(in oklch, var(--correct) 8%, var(--surface))",
    error: "color-mix(in oklch, var(--incorrect) 8%, var(--surface))",
    warning: "color-mix(in oklch, var(--warning) 8%, var(--surface))",
    info: "color-mix(in oklch, var(--a1) 8%, var(--surface))",
  };

  const borderColors = {
    success: "var(--correct)",
    error: "var(--incorrect)",
    warning: "var(--warning)",
    info: "var(--a1)",
  };

  const icons = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in-up p-0.5"
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md"
        style={{
          background: bgColors[notification.type],
          borderColor: borderColors[notification.type],
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg" style={{ color: borderColors[notification.type] }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d={icons[notification.type]} />
          </svg>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-text leading-tight">{notification.message}</p>
        </div>
        <button
          onClick={dismissNotification}
          className="shrink-0 p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-alt transition-all"
          aria-label="Dismiss alert"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
