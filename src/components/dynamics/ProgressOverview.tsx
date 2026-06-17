import { useStore } from "@nanostores/react";
import { completedLevels, getProgressPercent, streak } from "../../stores/progress";

const LEVELS = ["a1", "a2", "b1", "b1+", "b2", "b2+"];
const LABELS: Record<string, string> = { a1: "A1", a2: "A2", b1: "B1", "b1+": "B1+", b2: "B2", "b2+": "B2+" };

export default function ProgressOverview() {
  const $completed = useStore(completedLevels);
  const $streak = useStore(streak);
  const percent = getProgressPercent();
  const done = Object.entries($completed).filter(([,v]) => v).length;

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{done}/6 levels</span>
        <span className="text-text-muted">{percent}%</span>
        <span className="text-text-muted">🔥 {$streak} day streak</span>
      </div>
      <div className="flex h-3 gap-1 rounded-full bg-surface-alt p-0.5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        {LEVELS.map((id, i) => {
          const colors = ["a1", "a2", "b1", "b1p", "b2", "b2p"];
          const complete = $completed[id];
          return (
            <div
              key={id}
              className="h-full flex-1 rounded-full transition-all duration-500"
              style={{
                  background: complete
                    ? `var(--${colors[i]})`
                    : "var(--border)",
              }}
              title={`${LABELS[id]}: ${complete ? "Complete" : "Incomplete"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
