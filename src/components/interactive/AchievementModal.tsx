import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { showAchievementModal, dismissAchievement, markSeen, getAchievementDefs } from "../../stores/achievements";

export default function AchievementModal() {
  const achievementId = useStore(showAchievementModal);
  const [visible, setVisible] = useState(false);
  const defs = getAchievementDefs();

  useEffect(() => {
    if (achievementId) {
      setVisible(true);
      markSeen(achievementId);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dismissAchievement(), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievementId]);

  if (!achievementId) return null;

  const def = defs[achievementId];
  if (!def) return null;

  return (
    <div
      class={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 ${
        visible ? "animate-fade-in-up opacity-100" : "translate-y-4 opacity-0"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div class="rounded-xl border border-border bg-surface-raised p-5 shadow-lg">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/20 text-lg" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-warning">Achievement Unlocked!</p>
            <p class="mt-1 font-semibold">{def.title}</p>
            <p class="text-sm text-text-secondary">{def.desc}</p>
            <div class="mt-2 flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} class="inline-block h-1.5 w-6 rounded-full bg-warning/30" style={{ opacity: 1 - i * 0.25 }} />
              ))}
            </div>
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(() => dismissAchievement(), 300); }}
            class="shrink-0 rounded p-1 text-text-muted transition-colors hover:text-text"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
