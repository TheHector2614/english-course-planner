import { useState, useCallback, useEffect, useRef } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { unlockAchievement } from "../../stores/achievements";

interface CrosswordCell {
  row: number;
  col: number;
  answer: string;      // The correct letter
  number?: number;     // Clue number (for start of word)
  isBlack?: boolean;   // Black cell (block)
}

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
  grid: string[][];      // Grid of letters (empty string for black cells)
  clues: CrosswordClue[];
  rows: number;
  cols: number;
}

interface Props {
  puzzle: CrosswordData;
  level?: string;
}

export default function Crossword({ puzzle, level }: Props) {
  const { grid, clues, rows, cols, title } = puzzle;
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        grid[r][c] === "" ? "" : ""
      )
    )
  );
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => null)
    );
  }, [rows, cols]);

  const getCellKey = (r: number, c: number) => `${r}-${c}`;
  const isBlack = (r: number, c: number) => grid[r]?.[c] === "";

  // Get clue number for a cell
  const getCellNumber = (r: number, c: number): number | null => {
    for (const clue of clues) {
      if (clue.startRow === r && clue.startCol === c) return clue.number;
    }
    return null;
  };

  // Check which words are complete and correct
  const checkProgress = useCallback(() => {
    let correct = 0;
    let filled = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isBlack(r, c)) continue;
        if (userGrid[r][c]) filled++;
        if (userGrid[r][c]?.toLowerCase() === grid[r][c].toLowerCase()) correct++;
      }
    }
    setCorrectCount(correct);

    if (filled > 0 && correct === filled) {
      setCompleted(true);
      if (level) {
        addXP(XP_PER_EXERCISE * 2, "crossword");
        unlockAchievement("crossword_1");
      }
    }
  }, [userGrid, grid, rows, cols, level]);

  useEffect(() => {
    checkProgress();
  }, [userGrid, checkProgress]);

  const handleCellClick = (r: number, c: number) => {
    if (isBlack(r, c) || completed) return;
    if (activeCell?.row === r && activeCell?.col === c) {
      setDirection((prev) => (prev === "across" ? "down" : "across"));
    } else {
      setActiveCell({ row: r, col: c });
    }
    // Focus the input
    setTimeout(() => {
      inputRefs.current[r]?.[c]?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (completed) return;
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const newGrid = [...userGrid];
      newGrid[r] = [...newGrid[r]];
      if (newGrid[r][c]) {
        newGrid[r][c] = "";
        setUserGrid(newGrid);
      } else {
        // Move backwards
        const prev = getPrevCell(r, c);
        if (prev) {
          newGrid[prev.row] = [...newGrid[prev.row]];
          newGrid[prev.row][prev.col] = "";
          setUserGrid(newGrid);
          setActiveCell(prev);
          inputRefs.current[prev.row]?.[prev.col]?.focus();
        }
      }
      return;
    }

    if (key === "Tab") {
      e.preventDefault();
      const next = direction === "across"
        ? getNextCellAcross(r, c)
        : getNextCellDown(r, c);
      if (next) {
        setActiveCell(next);
        inputRefs.current[next.row]?.[next.col]?.focus();
      }
      return;
    }

    if (key === "ArrowRight" || key === "ArrowDown") {
      e.preventDefault();
      const nr = key === "ArrowDown" ? r + 1 : r;
      const nc = key === "ArrowRight" ? c + 1 : c;
      if (nr < rows && nc < cols && !isBlack(nr, nc)) {
        setActiveCell({ row: nr, col: nc });
        inputRefs.current[nr]?.[nc]?.focus();
      }
      return;
    }

    if (key === "ArrowLeft" || key === "ArrowUp") {
      e.preventDefault();
      const nr = key === "ArrowUp" ? r - 1 : r;
      const nc = key === "ArrowLeft" ? c - 1 : c;
      if (nr >= 0 && nc >= 0 && !isBlack(nr, nc)) {
        setActiveCell({ row: nr, col: nc });
        inputRefs.current[nr]?.[nc]?.focus();
      }
      return;
    }

    // Letter input
    if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault();
      const newGrid = [...userGrid];
      newGrid[r] = [...newGrid[r]];
      newGrid[r][c] = key.toLowerCase();
      setUserGrid(newGrid);

      // Move to next cell in direction
      const next = direction === "across"
        ? getNextCellAcross(r, c)
        : getNextCellDown(r, c);
      if (next) {
        setActiveCell(next);
        inputRefs.current[next.row]?.[next.col]?.focus();
      }
    }
  };

  const getNextCellAcross = (r: number, c: number): { row: number; col: number } | null => {
    for (let nc = c + 1; nc < cols; nc++) {
      if (!isBlack(r, nc)) return { row: r, col: nc };
    }
    return null;
  };

  const getNextCellDown = (r: number, c: number): { row: number; col: number } | null => {
    for (let nr = r + 1; nr < rows; nr++) {
      if (!isBlack(nr, c)) return { row: nr, col: c };
    }
    return null;
  };

  const getPrevCell = (r: number, c: number): { row: number; col: number } | null => {
    if (direction === "across") {
      for (let nc = c - 1; nc >= 0; nc--) {
        if (!isBlack(r, nc)) return { row: r, col: nc };
      }
    } else {
      for (let nr = r - 1; nr >= 0; nr--) {
        if (!isBlack(nr, c)) return { row: nr, col: c };
      }
    }
    return null;
  };

  const handleReveal = () => {
    const newRevealed: Record<string, boolean> = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!isBlack(r, c) && !userGrid[r][c]) {
          newRevealed[getCellKey(r, c)] = true;
        }
      }
    }
    setRevealed(newRevealed);
    const newGrid = [...userGrid];
    for (let r = 0; r < rows; r++) {
      newGrid[r] = [...newGrid[r]];
      for (let c = 0; c < cols; c++) {
        if (!isBlack(r, c) && !newGrid[r][c]) {
          newGrid[r][c] = grid[r][c];
        }
      }
    }
    setUserGrid(newGrid);
  };

  const handleReset = () => {
    setUserGrid(Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => grid[r][c] === "" ? "" : "")
    ));
    setRevealed({});
    setActiveCell(null);
    setCompleted(false);
    setCorrectCount(0);
  };

  // Determine the active clue
  const getActiveClue = () => {
    if (!activeCell) return null;
    const { row, col } = activeCell;
    // Find clue that starts at or passes through this cell
    for (const clue of clues) {
      if (clue.direction === direction) {
        if (clue.direction === "across") {
          if (clue.startRow === row && col >= clue.startCol && col < clue.startCol + clue.length) {
            return clue;
          }
        } else {
          if (clue.startCol === col && row >= clue.startRow && row < clue.startRow + clue.length) {
            return clue;
          }
        }
      }
    }
    // Fallback: find any clue through this cell
    for (const clue of clues) {
      if (clue.direction === "across" && clue.startRow === row && col >= clue.startCol && col < clue.startCol + clue.length) {
        return clue;
      }
      if (clue.direction === "down" && clue.startCol === col && row >= clue.startRow && row < clue.startRow + clue.length) {
        setDirection("down");
        return clue;
      }
    }
    return null;
  };

  const activeClue = getActiveClue();
  const totalCells = grid.flat().filter((c) => c !== "").length;
  const progressPct = totalCells > 0 ? Math.round((correctCount / totalCells) * 100) : 0;

  return (
    <div class="rounded-xl shadow-border bg-surface p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold font-display">{title}</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted tabular-nums">{progressPct}%</span>
          <div class="h-2 w-20 overflow-hidden rounded-full bg-surface-alt">
            <div class="h-full rounded-full bg-a1 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 md:flex-row">
        {/* Grid */}
        <div class="shrink-0">
          <div
            class="grid gap-px bg-border rounded-sm overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(32px, 40px))`,
              width: `calc(${cols} * 40px + ${cols - 1}px)`,
            }}
          >
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const cellKey = getCellKey(r, c);
                const value = userGrid[r]?.[c] || "";
                const isActive = activeCell?.row === r && activeCell?.col === c;
                const cellNum = getCellNumber(r, c);
                const isCorrect = value && value.toLowerCase() === grid[r][c].toLowerCase();
                const isWrong = value && value.toLowerCase() !== grid[r][c].toLowerCase();

                if (isBlack(r, c)) {
                  return <div key={cellKey} class="aspect-square bg-text" />;
                }

                return (
                  <div
                    key={cellKey}
                    class="relative bg-surface"
                    onClick={() => handleCellClick(r, c)}
                  >
                    {cellNum && (
                      <span class="absolute top-0 left-0.5 text-[9px] font-medium text-text-muted leading-none pointer-events-none">
                        {cellNum}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        if (!inputRefs.current[r]) inputRefs.current[r] = [];
                        inputRefs.current[r][c] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={value}
                      readOnly
                      tabIndex={-1}
                      class={`h-full w-full bg-transparent text-center text-base font-bold outline-none uppercase ${
                        isActive ? "bg-a1-bg text-a1" : isCorrect ? "text-correct" : isWrong ? "text-incorrect" : "text-text"
                      }`}
                      style={{
                        caretColor: "transparent",
                      }}
                      onFocus={() => setActiveCell({ row: r, col: c })}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                      aria-label={`Row ${r + 1} Column ${c + 1}${cellNum ? `, clue ${cellNum}` : ""}`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Controls */}
          <div class="mt-4 flex gap-2">
            <button onClick={handleReveal} disabled={completed} class="rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-border disabled:opacity-40 transition-colors">
              Reveal All
            </button>
            <button onClick={handleReset} class="rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-border transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Clues */}
        <div class="flex-1 min-w-0">
          {activeClue && (
            <div class="mb-3 rounded-lg bg-a1-bg/50 p-3 text-sm">
              <span class="font-medium">{activeClue.number}{activeClue.direction === "across" ? "A" : "D"}: </span>
              {activeClue.text} <span class="text-text-muted">({activeClue.length})</span>
            </div>
          )}

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 class="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Across</h4>
              <div class="space-y-0.5">
                {clues.filter((c) => c.direction === "across").map((clue) => (
                  <button
                    key={`a-${clue.number}`}
                    onClick={() => {
                      setDirection("across");
                      setActiveCell({ row: clue.startRow, col: clue.startCol });
                      inputRefs.current[clue.startRow]?.[clue.startCol]?.focus();
                    }}
                    class={`block w-full text-left px-2 py-0.5 rounded text-xs transition-colors ${
                      activeClue?.number === clue.number && direction === "across"
                        ? "bg-a1-bg text-a1 font-medium"
                        : "hover:bg-surface-alt text-text-secondary"
                    }`}
                  >
                    <span class="font-medium">{clue.number}.</span> {clue.text}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 class="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Down</h4>
              <div class="space-y-0.5">
                {clues.filter((c) => c.direction === "down").map((clue) => (
                  <button
                    key={`d-${clue.number}`}
                    onClick={() => {
                      setDirection("down");
                      setActiveCell({ row: clue.startRow, col: clue.startCol });
                      inputRefs.current[clue.startRow]?.[clue.startCol]?.focus();
                    }}
                    class={`block w-full text-left px-2 py-0.5 rounded text-xs transition-colors ${
                      activeClue?.number === clue.number && direction === "down"
                        ? "bg-a1-bg text-a1 font-medium"
                        : "hover:bg-surface-alt text-text-secondary"
                    }`}
                  >
                    <span class="font-medium">{clue.number}.</span> {clue.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {completed && (
            <div class="mt-4 animate-fade-in-scale rounded-lg p-3 text-center text-sm font-medium" style={{ background: "oklch(0.95 0.05 150 / 0.3)", color: "var(--correct)" }}>
              Crossword Complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
