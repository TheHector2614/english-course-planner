import { useState, useEffect } from "react";
import { activeChallenges, generateChallenges, type ChallengeDef } from "../../stores/challenges";
import { useStore } from "@nanostores/react";
import { ErrorBoundary } from "./ErrorBoundary";

const ICONS: Record<string, string> = {
  quiz: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  exercise: "M4 6h16M4 10h16M4 14h16M4 18h16",
  vocab: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  timer: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  read: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  crossword: "M4 4h16v16H4V4zm4 4h8M8 12h8M8 16h8",
  perfect: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  speak: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  dictation: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
  flashcard: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM7 10h10M7 14h6",
  streak: "M13 10V3L4 14h7v7l9-11h-7z",
  xp: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  accuracy: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  all: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
};

function DailyChallengeInner() {
  const challenges = useStore(activeChallenges);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    generateChallenges().then(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const items = Object.values(challenges);
  const daily = items.filter(c => c.type === "daily");
  const weekly = items.filter(c => c.type === "weekly");
  const completedCount = items.filter(c => c.completed).length;

  if (!loaded) {
    return (
      <div className="glass-card rounded-[var(--radius-lg)] p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-alt" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-alt" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Challenges</h3>
        {completedCount > 0 && (
          <span className="rounded-full bg-correct-bg px-2.5 py-0.5 text-xs font-bold text-correct" style={{ border: "1px solid color-mix(in oklch, var(--correct) 20%, transparent)" }}>
            {completedCount} completed
          </span>
        )}
      </div>

      {daily.length > 0 && (
        <div className="mb-5">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary opacity-80">Daily Challenges</p>
          <div className="space-y-3">
            {daily.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        </div>
      )}

      {weekly.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary opacity-80">Weekly Challenges</p>
          <div className="space-y-3">
            {weekly.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: ChallengeDef & { progress: number; completed: boolean } }) {
  const pct = Math.min((challenge.progress / challenge.goal) * 100, 100);

  const cardStyle = challenge.completed
    ? {
        border: "1px solid color-mix(in oklch, var(--correct) 30%, transparent)",
        background: "color-mix(in oklch, var(--correct) 5%, transparent)",
        boxShadow: "0 4px 12px -2px color-mix(in oklch, var(--correct) 12%, transparent)",
      }
    : {
        border: "1px solid var(--border-light)",
        background: "color-mix(in oklch, var(--surface-alt) 40%, transparent)",
      };

  return (
    <div
      className={`rounded-[var(--radius-md)] p-4 transition-all duration-300 ease-out hover:shadow-md hover:border-text-muted ${challenge.completed ? "opacity-90" : ""}`}
      style={cardStyle}
    >
      <div className="flex items-start gap-4">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: challenge.completed ? "var(--correct-bg)" : "var(--border-light)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            style={{ color: challenge.completed ? "var(--correct)" : "var(--text-secondary)" }}
          >
            <path d={ICONS[challenge.icon] || ICONS.exercise} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate text-text">{challenge.title}</p>
            <span className="shrink-0 text-xs font-bold" style={{ color: challenge.completed ? "var(--correct)" : "var(--focus-accent)" }}>
              {challenge.completed ? "Done" : `+${challenge.xpReward} XP`}
            </span>
          </div>
          <p className="text-xs text-text-secondary truncate mt-0.5">{challenge.desc}</p>
          <div className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden p-0.5 bg-surface-alt border border-border-light">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${pct}%`,
                background: challenge.completed ? "var(--correct)" : "var(--focus-accent)",
              }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] font-bold text-text-muted tabular-nums">{challenge.progress} / {challenge.goal}</p>
        </div>
      </div>
    </div>
  );
}

export default function DailyChallenge() {
  return (
    <ErrorBoundary fallbackTitle="Daily Challenge Error">
      <DailyChallengeInner />
    </ErrorBoundary>
  );
}
