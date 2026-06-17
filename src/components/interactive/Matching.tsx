import { useState, useEffect, useCallback } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";

interface MatchPair {
  left: string;
  right: string;
}

interface Props {
  title?: string;
  pairs: MatchPair[];
  level?: string;
}

export default function Matching({ title, pairs, level }: Props) {
  const [shuffledLeft, setShuffledLeft] = useState<{ text: string; originalIdx: number }[]>([]);
  const [shuffledRight, setShuffledRight] = useState<{ text: string; originalIdx: number }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIdx -> rightIdx
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const withIdx = pairs.map((p, i) => ({ text: p.left, originalIdx: i }));
    const shuffled = [...withIdx].sort(() => Math.random() - 0.5);
    setShuffledLeft(shuffled);

    const rightWithIdx = pairs.map((p, i) => ({ text: p.right, originalIdx: i }));
    const shuffledRight = [...rightWithIdx].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffledRight);
  }, [pairs]);

  const handleLeftClick = useCallback((leftIdx: number) => {
    if (submitted) return;
    setSelectedLeft((prev) => (prev === leftIdx ? null : leftIdx));
  }, [submitted]);

  const handleRightClick = useCallback((rightIdx: number) => {
    if (submitted || selectedLeft === null) return;

    const leftItem = shuffledLeft[selectedLeft];
    const rightItem = shuffledRight[rightIdx];

    // Check if this left or right already matched
    const leftAlreadyMatched = Object.values(matches).includes(rightIdx);
    const rightAlreadyMatched = matches[selectedLeft] !== undefined;

    if (leftAlreadyMatched || rightAlreadyMatched) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setMatches((prev) => ({ ...prev, [selectedLeft]: rightIdx }));
    setSelectedLeft(null);
  }, [submitted, selectedLeft, shuffledLeft, shuffledRight, matches]);

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    if (level) {
      addXP(XP_PER_EXERCISE, "matching");
    }
  };

  const score = showResults
    ? Object.entries(matches).filter(([leftIdx, rightIdx]) => {
        const leftItem = shuffledLeft[Number(leftIdx)];
        const rightItem = shuffledRight[rightIdx];
        return leftItem?.originalIdx === rightItem?.originalIdx;
      }).length
    : 0;

  const allMatched = Object.keys(matches).length === pairs.length;

  // Build match lines for visual connector
  const getMatchLines = () => {
    const lines = Object.entries(matches).map(([leftIdx, rightIdx]) => {
      const leftItem = shuffledLeft[Number(leftIdx)];
      const rightItem = shuffledRight[rightIdx];
      const isCorrect = submitted && leftItem?.originalIdx === rightItem?.originalIdx;
      return { leftIdx: Number(leftIdx), rightIdx, isCorrect };
    });
    return lines;
  };

  return (
    <div class={`rounded-xl shadow-border bg-surface p-6 ${shake ? "animate-shake" : ""}`}>
      {title && <h3 class="mb-4 text-lg font-semibold font-display">{title}</h3>}
      <p class="mb-4 text-sm text-text-secondary">Click a left item, then click its match on the right.</p>

      <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Left column */}
        <div class="space-y-2">
          {shuffledLeft.map((item, idx) => {
            const isSelected = selectedLeft === idx;
            const matchedRightIdx = matches[idx];
            const isMatched = matchedRightIdx !== undefined;
            const rightItem = isMatched ? shuffledRight[matchedRightIdx] : null;
            const isCorrect = submitted && isMatched && rightItem?.originalIdx === item.originalIdx;
            const isWrong = submitted && isMatched && rightItem?.originalIdx !== item.originalIdx;

            return (
              <button
                key={idx}
                onClick={() => handleLeftClick(idx)}
                disabled={submitted}
                class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-all disabled:cursor-default"
                style={{
                  borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : isSelected ? "var(--a1)" : isMatched ? "var(--a1-light)" : "var(--border)",
                  background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : isSelected ? "var(--a1-bg)" : isMatched ? "var(--a1-bg)" : "transparent",
                }}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Connector column */}
        <div class="flex flex-col items-center justify-center gap-2 pt-2">
          {shuffledLeft.map((_, idx) => {
            const matched = matches[idx];
            return (
              <div key={idx} class="flex h-10 items-center justify-center">
                {matched !== undefined ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--a1)" stroke-width="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                ) : (
                  <span class="block h-2 w-2 rounded-full bg-border" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div class="space-y-2">
          {shuffledRight.map((item, idx) => {
            const isMatched = Object.values(matches).includes(idx);
            const leftIdx = Object.entries(matches).find(([, v]) => v === idx)?.[0];
            const leftItem = leftIdx !== undefined ? shuffledLeft[Number(leftIdx)] : null;
            const isCorrect = submitted && leftItem?.originalIdx === item.originalIdx;
            const isWrong = submitted && leftItem && leftItem?.originalIdx !== item.originalIdx;

            return (
              <button
                key={idx}
                onClick={() => handleRightClick(idx)}
                disabled={submitted || selectedLeft === null || isMatched}
                class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-all disabled:cursor-default"
                style={{
                  borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : isMatched ? "var(--a1-light)" : "var(--border)",
                  background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : isMatched ? "var(--a1-bg)" : selectedLeft !== null && !isMatched ? "var(--surface-alt)" : "transparent",
                  opacity: isMatched && !isCorrect && !submitted ? 0.5 : 1,
                }}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allMatched}
          class="mt-6 w-full rounded-full px-6 py-3 font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: allMatched ? "var(--a1)" : "var(--border)" }}
        >
          {allMatched ? "Check Answers" : `Match all pairs (${Object.keys(matches).length}/${pairs.length})`}
        </button>
      ) : (
        <div class="mt-6 rounded-lg p-4 text-center" style={{ background: score >= pairs.length * 0.7 ? "var(--correct-bg)" : "var(--incorrect-bg)" }}>
          <p class="text-xl font-bold">{score}/{pairs.length} correct ({Math.round((score / pairs.length) * 100)}%)</p>
        </div>
      )}
    </div>
  );
}
