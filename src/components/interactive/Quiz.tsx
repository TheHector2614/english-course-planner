import { useState } from "react";
import { saveQuizResult } from "../../stores/progress";

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

export default function Quiz({ level, questions }: Props) {
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
  };

  const score = showResults ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0) : 0;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
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
                background: isCorrect ? "oklch(0.95 0.05 150 / 0.3)" : isWrong ? "oklch(0.95 0.05 30 / 0.3)" : "transparent",
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
                      class="flex items-center gap-3 rounded-lg border px-4 py-2 text-left text-sm transition-all disabled:cursor-default"
                      style={{
                        borderColor: isCorrectOpt ? "var(--correct)" : isSelected && !submitted ? "var(--a1)" : "var(--border)",
                        background: isCorrectOpt ? "oklch(0.95 0.05 150 / 0.3)" : isSelected && !submitted ? "var(--a1-bg)" : "transparent",
                      }}
                    >
                      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs"
                        style={{
                          borderColor: isCorrectOpt ? "var(--correct)" : isSelected ? "var(--a1)" : "var(--border)",
                          background: isCorrectOpt ? "var(--correct)" : isSelected && !submitted ? "var(--a1)" : "transparent",
                          color: isCorrectOpt || (isSelected && !submitted) ? "#fff" : undefined,
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
        <div class="mt-6 rounded-lg p-4 text-center" style={{ background: score >= 7 ? "oklch(0.95 0.05 150 / 0.3)" : "oklch(0.95 0.05 30 / 0.3)" }}>
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
