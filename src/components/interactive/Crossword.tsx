import { useState, useCallback, useEffect, useRef } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { unlockAchievement } from "../../stores/achievements";
import { updateChallengeProgress } from "../../stores/challenges";
import { ErrorBoundary } from "./ErrorBoundary";

interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  text: string;
  length: number;
  startRow: number;
  startCol: number;
}

interface CrosswordData {
  title: string;
  grid: string[][];
  clues: CrosswordClue[];
  rows: number;
  cols: number;
}

interface Props { puzzle: CrosswordData; level?: string; }

function CrosswordInner({ puzzle, level }: Props) {
  const { grid, clues, rows, cols, title } = puzzle;
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))
  );
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [dir, setDir] = useState<"across" | "down">("across");
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const totalCells = grid.flat().filter(c => c !== "").length;

  const isBlack = (r: number, c: number) => grid[r]?.[c] === "";

  const checkProgress = useCallback((g: string[][]) => {
    let correct = 0, filled = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (isBlack(r, c)) continue;
        if (g[r][c]) filled++;
        if (g[r][c]?.toLowerCase() === grid[r][c].toLowerCase()) correct++;
      }
    if (filled === totalCells && correct === totalCells && !revealed && level) {
      setCompleted(true);
      addXP(XP_PER_EXERCISE * 2, "crossword");
      unlockAchievement("crossword_1");
      updateChallengeProgress("daily_crossword", 1);
      updateChallengeProgress("weekly_all_exercises", 1);
    }
  }, [grid, rows, cols, level, revealed]);

  useEffect(() => { checkProgress(userGrid); }, [userGrid, checkProgress]);

  const focus = (r: number, c: number) => {
    const el = document.getElementById(`cw-${r}-${c}`) as HTMLInputElement | null;
    if (el) { el.focus(); setActive({ r, c }); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (completed || !active) return;
    const { r, c } = active;
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      if (userGrid[r][c]) {
        setUserGrid(g => { const n = g.map(r => [...r]); n[r][c] = ""; return n; });
      } else {
        const dr = dir === "across" ? 0 : -1, dc = dir === "across" ? -1 : 0;
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nc >= 0 && nr < rows && nc < cols) {
          if (!isBlack(nr, nc)) { focus(nr, nc); setUserGrid(g => { const n = g.map(r => [...r]); n[nr][nc] = ""; return n; }); break; }
          nr += dr; nc += dc;
        }
      }
      return;
    }
    if (key === "Tab") { e.preventDefault(); const n = next(r, c, dir); if (n) focus(n.r, n.c); return; }
    if (key === "ArrowRight") { e.preventDefault(); const n = next(r, c, "across"); if (n) focus(n.r, n.c); return; }
    if (key === "ArrowLeft") { e.preventDefault(); const n = prev(r, c, "across"); if (n) focus(n.r, n.c); return; }
    if (key === "ArrowDown") { e.preventDefault(); const n = next(r, c, "down"); if (n) focus(n.r, n.c); return; }
    if (key === "ArrowUp") { e.preventDefault(); const n = prev(r, c, "down"); if (n) focus(n.r, n.c); return; }
    if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      setUserGrid(g => { const n = g.map(r => [...r]); n[r][c] = key.toLowerCase(); return n; });
      const n = next(r, c, dir);
      if (n) focus(n.r, n.c);
    }
  };

  const next = (r: number, c: number, d: string) => {
    const dr = d === "down" ? 1 : 0, dc = d === "across" ? 1 : 0;
    for (let nr = r + dr, nc = c + dc; nr < rows && nc < cols; nr += dr, nc += dc)
      if (!isBlack(nr, nc)) return { r: nr, c: nc };
    return null;
  };
  const prev = (r: number, c: number, d: string) => {
    const dr = d === "down" ? -1 : 0, dc = d === "across" ? -1 : 0;
    for (let nr = r + dr, nc = c + dc; nr >= 0 && nc >= 0; nr += dr, nc += dc)
      if (!isBlack(nr, nc)) return { r: nr, c: nc };
    return null;
  };

  const getCellNum = (r: number, c: number) => {
    for (const cl of clues) if (cl.startRow === r && cl.startCol === c) return cl.number;
    return null;
  };

  const getActiveClue = () => {
    if (!active) return null;
    const { r, c } = active;
    for (const cl of clues) {
      if (cl.direction === dir && ((cl.direction === "across" && cl.startRow === r && c >= cl.startCol && c < cl.startCol + cl.length)
        || (cl.direction === "down" && cl.startCol === c && r >= cl.startRow && r < cl.startRow + cl.length))) return cl;
    }
    for (const cl of clues) {
      if (cl.direction === "across" && cl.startRow === r && c >= cl.startCol && c < cl.startCol + cl.length) return cl;
      if (cl.direction === "down" && cl.startCol === c && r >= cl.startRow && r < cl.startRow + cl.length) { setDir("down"); return cl; }
    }
    return null;
  };

  const correctCount = (() => {
    let n = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!isBlack(r, c) && userGrid[r]?.[c]?.toLowerCase() === grid[r][c].toLowerCase()) n++;
    return n;
  })();

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold font-display">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted tabular-nums">{Math.round((correctCount / totalCells) * 100)}%</span>
          <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-alt">
            <div className="h-full rounded-full bg-a1 transition-all" style={{ width: `${(correctCount / totalCells) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row" onKeyDown={handleKey}>
        <table className="shrink-0 border-collapse" style={{ borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => {
                  if (isBlack(r, c)) return <td key={c} className="w-9 h-9 p-0" style={{ background: "var(--text)" }} />;
                  const val = userGrid[r]?.[c] || "";
                  const isAct = active?.r === r && active?.c === c;
                  const num = getCellNum(r, c);
                  const isCorrect = val && val.toLowerCase() === grid[r][c].toLowerCase();
                  const isWrong = val && val.toLowerCase() !== grid[r][c].toLowerCase();
                  return (
                    <td key={c} className="relative w-9 h-9 p-0 align-top" style={{ border: "1px solid var(--border)", ...(isAct ? { background: "var(--a1-bg)" } : {}) }}>
                      {num && <span className="absolute top-0 left-0.5 text-[9px] font-medium text-text-muted leading-none pointer-events-none">{num}</span>}
                      <input id={`cw-${r}-${c}`} type="text" maxLength={1} readOnly tabIndex={-1} value={val}
                        className="h-full w-full bg-transparent text-center text-base font-bold outline-none uppercase"
                        style={{ color: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--text)", caretColor: "transparent" }}
                        onFocus={() => { if (!isBlack(r, c) && !completed) { if (active?.r === r && active?.c === c) setDir(d => d === "across" ? "down" : "across"); else { setActive({ r, c }); } } }} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex-1 min-w-0">
          {(() => { const ac = getActiveClue(); return ac ? <div className="mb-3 rounded-lg bg-a1-bg/50 p-3 text-sm"><span className="font-medium">{ac.number}{ac.direction === "across" ? "A" : "D"}: </span>{ac.text} <span className="text-text-muted">({ac.length})</span></div> : null; })()}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Across</h4>
              {clues.filter(c => c.direction === "across").map(cl => (
                <button key={cl.number} onClick={() => { setDir("across"); focus(cl.startRow, cl.startCol); }}
                  className={`block w-full text-left min-h-11 px-3 py-2.5 rounded text-sm transition-colors ${getActiveClue()?.number === cl.number && dir === "across" ? "bg-a1-bg text-a1 font-medium" : "hover:bg-surface-alt text-text-secondary"}`}>
                  <span className="font-medium">{cl.number}.</span> {cl.text}
                </button>
              ))}
            </div>
            <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Down</h4>
              {clues.filter(c => c.direction === "down").map(cl => (
                <button key={cl.number} onClick={() => { setDir("down"); focus(cl.startRow, cl.startCol); }}
                  className={`block w-full text-left min-h-11 px-3 py-2.5 rounded text-sm transition-colors ${getActiveClue()?.number === cl.number && dir === "down" ? "bg-a1-bg text-a1 font-medium" : "hover:bg-surface-alt text-text-secondary"}`}>
                  <span className="font-medium">{cl.number}.</span> {cl.text}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => { revealed || setRevealed(true); setUserGrid(grid.map(r => [...r])); }} disabled={completed}
              className="min-h-11 rounded-lg bg-surface-alt px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-border disabled:opacity-40 transition-colors">Reveal All</button>
            <button onClick={() => { setRevealed(false); setCompleted(false); setActive(null); setUserGrid(Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))); }}
              className="min-h-11 rounded-lg bg-surface-alt px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-border transition-colors">Reset</button>
          </div>

          {completed && <div className="mt-4 animate-fade-in-scale rounded-lg p-3 text-center text-sm font-medium" style={{ background: "var(--correct-bg)", color: "var(--correct)" }}>Complete!</div>}
        </div>
      </div>
    </div>
  );
}

export default function Crossword(props: Props) {
  return (
    <ErrorBoundary fallbackTitle="Crossword Error">
      <CrosswordInner {...props} />
    </ErrorBoundary>
  );
}
