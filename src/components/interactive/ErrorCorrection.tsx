import { useState } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";

interface ErrorQuestion {
  incorrect: string;    // The sentence with error
  correct: string;      // The corrected version
  explanation: string;  // Why it's wrong
}

interface Props {
  title?: string;
  questions: ErrorQuestion[];
  level?: string;
}

export default function ErrorCorrection({ title, questions, level }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (idx: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    if (level) {
      addXP(XP_PER_EXERCISE, "error_correction");
    }
  };

  // Normalize for comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

  const score = showResults
    ? questions.reduce((acc, q, i) => acc + (normalize(answers[i] || "") === normalize(q.correct) ? 1 : 0), 0)
    : 0;

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  return (
    <div class="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 class="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div class="space-y-5">
        {questions.map((q, i) => {
          const userAnswer = answers[i] || "";
          const isCorrect = submitted && normalize(userAnswer) === normalize(q.correct);
          const isWrong = submitted && userAnswer.trim() !== "" && !isCorrect;

          return (
            <div
              key={i}
              class="rounded-lg border p-4 transition-all"
              style={{
                borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                background: isCorrect ? "oklch(0.95 0.05 150 / 0.3)" : isWrong ? "oklch(0.95 0.05 30 / 0.3)" : "transparent",
              }}
            >
              <p class="mb-1 text-sm font-medium">Question {i + 1}</p>
              <div class="rounded-lg bg-incorrect/10 border border-incorrect/20 px-4 py-3 text-base">
                <span class="line-through decoration-2 decoration-incorrect">{q.incorrect}</span>
              </div>

              <div class="mt-3">
                <label class="text-xs font-medium text-text-secondary">Write the corrected version:</label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => handleChange(i, e.target.value)}
                  disabled={submitted}
                  placeholder="Correct the sentence..."
                  class="mt-1 w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors disabled:opacity-60"
                  style={{
                    borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                    background: isCorrect ? "oklch(0.95 0.05 150 / 0.3)" : isWrong ? "oklch(0.95 0.05 30 / 0.3)" : "transparent",
                  }}
                />
              </div>

              {submitted && (
                <div class="mt-2 space-y-1 animate-fade-in">
                  <p class="text-sm" style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
                    {isCorrect ? "Correct!" : `Answer: ${q.correct}`}
                  </p>
                  <p class="text-xs text-text-secondary">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          class="mt-6 w-full rounded-full px-6 py-3 font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: allAnswered ? "var(--a1)" : "var(--border)" }}
        >
          Check Answers
        </button>
      ) : (
        <div class="mt-6 rounded-lg p-4 text-center" style={{ background: score >= questions.length * 0.7 ? "oklch(0.95 0.05 150 / 0.3)" : "oklch(0.95 0.05 30 / 0.3)" }}>
          <p class="text-xl font-bold">{score}/{questions.length} correct ({Math.round((score / questions.length) * 100)}%)</p>
        </div>
      )}
    </div>
  );
}
