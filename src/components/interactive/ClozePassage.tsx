import { useState } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";

interface ClozeBlank {
  correct: string;
  options?: string[];
  explanation: string;
}

interface Props {
  title?: string;
  text: string;
  blanks: ClozeBlank[];
  level?: string;
}

export default function ClozePassage({ title, text, blanks, level }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (idx: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (level) {
      addXP(XP_PER_EXERCISE, "cloze_passage");
      updateChallengeProgress("daily_complete_exercises", 1);
      updateChallengeProgress("weekly_exercises", 1);
    }
  };

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

  const isCorrect = (idx: number) =>
    normalize(answers[idx] || "") === normalize(blanks[idx].correct);

  const score = submitted
    ? blanks.reduce((acc, _, i) => acc + (isCorrect(i) ? 1 : 0), 0)
    : 0;

  const allAnswered = blanks.every((_, i) => answers[i]?.trim());

  const parts = text.split(/(\{\d+\})/g);

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div className="rounded-xl bg-surface-alt p-5 text-base leading-relaxed border border-border">
        {parts.map((part, i) => {
          const match = part.match(/^\{(\d+)\}$/);
          if (!match) return <span key={i}>{part}</span>;

          const idx = parseInt(match[1]);
          const blank = blanks[idx];
          const userAnswer = answers[idx] || "";
          const blankCorrect = submitted && isCorrect(idx);
          const blankWrong = submitted && userAnswer.trim() !== "" && !blankCorrect;

          return (
            <span key={i} className="inline-block mx-0.5 align-baseline">
              {blank.options ? (
                <select
                  value={userAnswer}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  disabled={submitted}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm outline-none transition-colors disabled:opacity-60 ${
                    submitted
                      ? blankCorrect
                        ? "border-correct bg-correct-bg text-correct"
                        : blankWrong
                          ? "border-incorrect bg-incorrect-bg text-incorrect"
                          : "border-border"
                      : "border-border hover:border-text-muted"
                  }`}
                  style={{ minWidth: 120 }}
                  aria-label={`Blank ${idx + 1}`}
                >
                  <option value="">___</option>
                  {blank.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  disabled={submitted}
                  placeholder="___"
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm outline-none transition-colors disabled:opacity-60 ${
                    submitted
                      ? blankCorrect
                        ? "border-correct bg-correct-bg text-correct"
                        : blankWrong
                          ? "border-incorrect bg-incorrect-bg text-incorrect"
                          : "border-border"
                      : "border-border"
                  }`}
                  style={{ minWidth: 100 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const next = parts.findIndex((p, j) => j > i && /^\{(\d+)\}$/.test(p));
                      if (next !== -1) {
                        const nextIdx = parseInt(parts[next].match(/^\{(\d+)\}$/)![1]);
                        const el = document.getElementById(`cloze-input-${nextIdx}`);
                        el?.focus();
                      }
                    }
                  }}
                  id={`cloze-input-${idx}`}
                  aria-label={`Blank ${idx + 1}`}
                />
              )}
              {submitted && !blankCorrect && (
                <span className="ml-1 text-xs text-incorrect">({blank.correct})</span>
              )}
            </span>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {blanks.map((blank, i) => {
            const userAnswer = answers[i] || "";
            const blankCorrect = isCorrect(i);
            if (blankCorrect) return null;
            return (
              <p key={i} className="text-xs text-text-secondary">
                <span className="font-medium">Blank {i + 1}:</span> {blank.explanation}
              </p>
            );
          })}
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-6 w-full min-h-11 rounded-full px-6 py-3 font-semibold text-white transition-opacity disabled:opacity-40 active-scale"
          style={{ background: allAnswered ? "var(--a1)" : "var(--border)" }}
        >
          Check Answers
        </button>
      ) : (
        <div className="mt-6 rounded-lg p-4 text-center animate-fade-in" style={{ background: score >= blanks.length * 0.7 ? "var(--correct-bg)" : "var(--incorrect-bg)" }}>
          <p className="text-xl font-bold">{score}/{blanks.length} correct ({Math.round((score / blanks.length) * 100)}%)</p>
        </div>
      )}
    </div>
  );
}