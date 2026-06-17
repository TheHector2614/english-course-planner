import { useState } from "react";
import { saveQuizResult } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";
import { ErrorBoundary } from "./ErrorBoundary";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  level: string;
  questions: Question[];
}

function QuizInner({ level, questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
    const passed = score / questions.length >= 0.7;
    saveQuizResult(level, {
      score,
      total: questions.length,
      passed,
      answers: questions.map((q) => answers[q.id] ?? -1),
      timestamp: Date.now(),
    });
    const pct = score / questions.length;
    if (pct >= 0.8) updateChallengeProgress("daily_score_quiz", 1);
    if (pct === 1) updateChallengeProgress("daily_perfect_quiz", 1);
    if (pct >= 0.9) updateChallengeProgress("weekly_quizzes", 1);
  };

  const score = showResults ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0) : 0;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div class="rounded-xl shadow-border bg-surface p-6">
      <div class="space-y-6">
        {questions.map((q) => {
          const selected = answers[q.id];
          const isCorrect = submitted && selected === q.correct;
          const isWrong = submitted && selected !== undefined && selected !== q.correct;
          return (
            <div
              key={q.id}
              class="rounded-lg border p-4 transition-colors"
              style={{
                borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "transparent",
              }}
            >
              <p class="mb-3 font-medium">{q.id}. {q.question}</p>
              <div class="grid gap-2">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOpt = submitted && i === q.correct;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(q.id, i)}
                      disabled={submitted}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${String.fromCharCode(65 + i)}: ${opt}${
                        submitted && isCorrectOpt ? " (Correct Answer)" : ""
                      }${submitted && isSelected && !isCorrectOpt ? " (Incorrect Selection)" : ""}`}
                      class="flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all disabled:cursor-default sm:py-2 focus-visible:ring-2 focus-visible:ring-a1 outline-none"
                      style={{
                        borderColor: isCorrectOpt ? "var(--correct)" : isSelected && !submitted ? "var(--a1)" : "var(--border)",
                        background: isCorrectOpt ? "var(--correct-bg)" : isSelected && !submitted ? "var(--a1-bg)" : "transparent",
                      }}
                    >
                      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs"
                        style={{
                          borderColor: isCorrectOpt ? "var(--correct)" : isSelected ? "var(--a1)" : "var(--border)",
                          background: isCorrectOpt ? "var(--correct)" : isSelected && !submitted ? "var(--a1)" : "transparent",
                          color: isCorrectOpt || (isSelected && !submitted) ? "var(--surface)" : undefined,
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p class="mt-2 text-sm" style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
                  {isCorrect ? "Correct!" : isWrong ? q.explanation : ""}
                </p>
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
          {allAnswered ? "Check Answers" : "Answer all questions first"}
        </button>
      ) : (
        <div class="mt-6 rounded-lg p-4 text-center" style={{ background: score / questions.length >= 0.7 ? "var(--correct-bg)" : "var(--incorrect-bg)" }}>
          <p class="text-xl font-bold">
            {score}/{questions.length} correct ({Math.round((score / questions.length) * 100)}%)
          </p>
          <p class="text-sm text-text-secondary">
            {score / questions.length >= 0.7 ? "Passed! Level completed." : "Keep practicing to pass (70% needed)."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Quiz(props: Props) {
  return (
    <ErrorBoundary fallbackTitle="Quiz Error">
      <QuizInner {...props} />
    </ErrorBoundary>
  );
}
