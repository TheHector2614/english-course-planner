import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { ErrorBoundary } from "./ErrorBoundary";
import { xp, completedLevels, streak, lastStudyDate, getProgressPercent, settingsLoading } from "../../stores/progress";
import { activeChallenges } from "../../stores/challenges";
import { unlockedAchievements } from "../../stores/achievements";
import { getDueWords } from "../../stores/vocabulary";
import { storiesByLevel } from "../../data/stories";
import { focusMode, FOCUS_LABELS, FOCUS_DESCS } from "../../stores/modes";
import type { SavedWord } from "../../stores/db";

interface PlanItem {
  id: string;
  title: string;
  desc: string;
  xp: number;
  href: string;
  priority: number;
  icon: string;
  badge?: { current: number; goal: number };
}

const LEVEL_LABELS: Record<string, string> = {
  a1: "A1 Beginner",
  a2: "A2 Elementary",
  b1: "B1 Intermediate",
  "b1+": "B1+ Upper Intermediate",
  b2: "B2 Advanced",
  "b2+": "B2+ Pre-Advanced",
};

const ICONS: Record<string, string> = {
  vocab: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  flashcard: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM7 10h10M7 14h6",
  read: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  target: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

function DailyPlanInner() {
  const currentXp = useStore(xp);
  const currentStreak = useStore(streak);
  const levels = useStore(completedLevels);
  const challenges = useStore(activeChallenges);
  const achievements = useStore(unlockedAchievements);
  const currentFocus = useStore(focusMode);
  const isLoadingSettings = useStore(settingsLoading);
  const [dueWords, setDueWords] = useState<SavedWord[]>([]);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getDueWords().then((res) => {
      if (active) setDueWords(res);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!dueWords) return;

    const items: PlanItem[] = [];
    const completedCount = Object.values(levels).filter(Boolean).length;
    const challengeList = Object.values(challenges);
    const focusLabel = FOCUS_LABELS[currentFocus];

    // 1. Due vocabulary reviews (highest priority)
    if (dueWords.length > 0) {
      items.push({
        id: "review-words",
        title: "Review due words",
        desc: `You have ${dueWords.length} word${dueWords.length > 1 ? "s" : ""} waiting for review`,
        xp: dueWords.length * 3,
        href: "/vocabulary",
        priority: 1,
        icon: "flashcard",
        badge: { current: 0, goal: dueWords.length },
      });
    }

    // 2. Pending challenges with most progress
    const pendingChallenges = challengeList.filter(c => !c.completed);
    const sortedChallenges = pendingChallenges.sort((a, b) => {
      const aPct = a.goal > 0 ? a.progress / a.goal : 0;
      const bPct = b.goal > 0 ? b.progress / b.goal : 0;
      return bPct - aPct;
    });

    for (const c of sortedChallenges.slice(0, 2)) {
      items.push({
        id: `challenge-${c.id}`,
        title: c.title,
        desc: c.desc,
        xp: c.xpReward,
        href: "/dashboard",
        priority: c.type === "daily" ? 2 : 3,
        icon: c.icon,
        badge: { current: c.progress, goal: c.goal },
      });
    }

    // 3. Next level to study (focus-aware)
    const levelOrder = ["a1", "a2", "b1", "b1+", "b2", "b2+"];
    const nextLevel = levelOrder.find(l => !levels[l]);
    if (nextLevel) {
      items.push({
        id: `level-${nextLevel}`,
        title: `Study ${LEVEL_LABELS[nextLevel]}`,
        desc: `${focusLabel} — continue your learning path`,
        xp: 50,
        href: `/level/${nextLevel}`,
        priority: 4,
        icon: "target",
      });
    }

    // 3b. Focus-specific recommendation
    if (currentFocus !== "general") {
      items.push({
        id: `focus-${currentFocus}`,
        title: `${focusLabel} Practice`,
        desc: FOCUS_DESCS[currentFocus],
        xp: 40,
        href: `/level/${nextLevel || levelOrder[Math.min(completedCount, 5)]}`,
        priority: 3,
        icon: currentFocus === "business" ? "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-6 2h-2m4 0h2m-2 2v4m-4-4h-2m4 0h2m-8 4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m12 14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4z" : "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      });
    }

    // 4. Unread story from next level
    const levelForStory = nextLevel || levelOrder[Math.min(completedCount, 5)];
    const availableStories = storiesByLevel[levelForStory] || [];
    if (availableStories.length > 0 && nextLevel) {
      items.push({
        id: "read-story",
        title: "Read a story",
        desc: `${availableStories[0].title} — ${availableStories[0].words} words`,
        xp: 30,
        href: `/reading/${availableStories[0].id}`,
        priority: 5,
        icon: "read",
      });
    }

    // 5. Save new words (general recommendation)
    items.push({
      id: "save-words",
      title: "Grow your vocabulary",
      desc: "Look up and save new words from the dictionary",
      xp: 10,
      href: "/dictionary",
      priority: 6,
      icon: "vocab",
    });

    items.sort((a, b) => a.priority - b.priority);
    setPlan(items.slice(0, 5));
    setLoaded(true);
  }, [dueWords, levels, challenges, achievements]);

  if (!loaded || isLoadingSettings) {
    return (
      <div class="glass-card rounded-[var(--radius-lg)] p-5">
        <div class="h-4 w-40 animate-pulse rounded bg-surface-alt" />
        <div class="mt-4 space-y-3">
          {[1, 2, 3].map(i => <div key={i} class="h-14 animate-pulse rounded-lg bg-surface-alt" />)}
        </div>
      </div>
    );
  }

  return (
    <div class="glass-card rounded-[var(--radius-lg)] p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-text-muted">Plan</h3>
        <span class="rounded-full px-2.5 py-0.5 text-xs font-bold text-focus-accent bg-focus-accent-bg" style={{ border: "1px solid color-mix(in oklch, var(--focus-accent) 20%, transparent)" }}>
          {FOCUS_LABELS[currentFocus].split(" ")[0]} · {currentXp} XP
        </span>
      </div>

      <div class="space-y-3">
        {plan.map((item) => {
          const isPriority = item.id === "review-words";
          const cardStyle = isPriority
            ? {
                border: "1px solid color-mix(in oklch, var(--incorrect) 30%, transparent)",
                background: "color-mix(in oklch, var(--incorrect) 5%, transparent)",
              }
            : {
                border: "1px solid var(--border-light)",
                background: "color-mix(in oklch, var(--surface-alt) 40%, transparent)",
              };

          return (
            <a
              key={item.id}
              href={item.href}
              class="flex items-start gap-4 rounded-[var(--radius-md)] p-4 transition-all duration-300 ease-out hover:border-focus-accent hover:shadow-md active-scale"
              style={cardStyle}
            >
              <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: isPriority ? "color-mix(in oklch, var(--incorrect) 15%, transparent)" : "var(--focus-accent-bg)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isPriority ? "var(--incorrect)" : "var(--focus-accent)"} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d={ICONS[item.icon] || ICONS.star} />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold truncate text-text">{item.title}</p>
                  <span class="shrink-0 text-xs font-bold" style={{ color: isPriority ? "var(--incorrect)" : "var(--focus-accent)" }}>+{item.xp} XP</span>
                </div>
                <p class="text-xs text-text-secondary truncate mt-0.5">{item.desc}</p>
                {item.badge && (
                  <div class="mt-2.5 h-1.5 w-full rounded-full overflow-hidden p-0.5 bg-surface-alt border border-border-light">
                    <div
                      class="h-full rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${Math.min((item.badge.current / item.badge.goal) * 100, 100)}%`,
                        opacity: item.badge.goal > 0 ? 1 : 0,
                        background: isPriority ? 'var(--incorrect)' : 'var(--focus-accent)',
                      }}
                    />
                  </div>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5" class="mt-1 shrink-0 transition-transform hover:translate-x-0.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function DailyPlan() {
  return (
    <ErrorBoundary fallbackTitle="Daily Plan Error">
      <DailyPlanInner />
    </ErrorBoundary>
  );
}