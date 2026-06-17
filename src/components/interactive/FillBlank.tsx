import { useState } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";

interface FillBlankQuestion {
  sentence: string;   // Use ___ for the blank
  answer: string;
  options?: string[];  // If provided, show as multiple choice
  explanation?: string;
}

interface Props {
  title?: string;
  questions: FillBlankQuestion[];
  level?: string;
}

export default function FillBlank({ title, questions, level }: Props) {
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
    const score = questions.reduce((acc, q, i) => acc + (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase() ? 1 : 0), 0);
    const passed = score / questions.length >= 0.7;
    if (level) {
      addXP(XP_PER_EXERCISE, "fill_blank");
    }
    updateChallengeProgress("daily_complete_exercises", 1);
    updateChallengeProgress("weekly_exercises", 1);
  };

  const score = showResults ? questions.reduce((acc, q, i) => acc + (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase() ? 1 : 0), 0) : 0;
  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div className="space-y-5">
        {questions.map((q, i) => {
          const userAnswer = answers[i] || "";
          const isCorrect = submitted && userAnswer.toLowerCase().trim() === q.answer.toLowerCase();
          const isWrong = submitted && userAnswer.trim() !== "" && !isCorrect;

          // Render sentence with ___ replaced by input
          const parts = q.sentence.split("___");

          return (
            <div
              key={i}
              className="rounded-lg border p-4 transition-all"
              style={{
                borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "transparent",
              }}
            >
              <p className="mb-3 text-sm font-medium">Question {i + 1}</p>

              <div className="flex flex-wrap items-center gap-2 text-base leading-relaxed">
                {parts.map((part, pIdx) => (
                  <span key={pIdx}>
                    {part}
                    {pIdx < parts.length - 1 && (
                      q.options ? (
                        <select
                          value={userAnswer}
                          onChange={(e) => handleChange(i, e.target.value)}
                          disabled={submitted}
                          className="mx-1 inline-block min-h-11 rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60"
                          style={{
                            borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--a1)",
                            background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "var(--surface-alt)",
                          }}
                          aria-label={`Blank ${pIdx + 1} for question ${i + 1}`}
                        >
                          <option value="">Choose...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => handleChange(i, e.target.value)}
                          disabled={submitted}
                          placeholder="type answer..."
                          className="mx-1 inline-block min-h-11 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors disabled:opacity-60"
                          style={{
                            borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                            background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "transparent",
                          }}
                          aria-label={`Blank ${pIdx + 1} for question ${i + 1}`}
                        />
                      )
                    )}
                  </span>
                ))}
              </div>

              {submitted && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm" style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
                    {isCorrect ? "Correct!" : `Answer: ${q.answer}`}
                  </p>
                  {q.explanation && !isCorrect && (
                    <p className="text-xs text-text-secondary">{q.explanation}</p>
                  )}
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
          className="mt-6 w-full rounded-full px-6 py-3 font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: allAnswered ? "var(--a1)" : "var(--border)" }}
        >
          Check Answers
        </button>
      ) : (
        <div className="mt-6 rounded-lg p-4 text-center" style={{ background: score >= questions.length * 0.7 ? "var(--correct-bg)" : "var(--incorrect-bg)" }}>
          <p className="text-xl font-bold">
            {score}/{questions.length} correct ({Math.round((score / questions.length) * 100)}%)
          </p>
          <p className="text-sm text-text-secondary">
            {score / questions.length >= 0.7 ? "Great job!" : "Keep practicing."}
          </p>
        </div>
      )}
    </div>
  );
}
