import { useState } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";

interface TransformationQuestion {
  prompt: string;
  startWith: string;
  correct: string[];
  hint: string;
  explanation: string;
}

interface Props {
  title?: string;
  questions: TransformationQuestion[];
  level?: string;
}

export default function SentenceTransformation({ title, questions, level }: Props) {
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
      addXP(XP_PER_EXERCISE, "sentence_transformation");
      updateChallengeProgress("daily_complete_exercises", 1);
      updateChallengeProgress("weekly_exercises", 1);
    }
  };

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

  const isAnswerCorrect = (idx: number) => {
    const userAnswer = normalize(answers[idx] || "");
    return questions[idx].correct.some((c) => normalize(c) === userAnswer);
  };

  const score = showResults
    ? questions.reduce((acc, _, i) => acc + (isAnswerCorrect(i) ? 1 : 0), 0)
    : 0;

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div className="space-y-5">
        {questions.map((q, i) => {
          const userAnswer = answers[i] || "";
          const correct = isAnswerCorrect(i);
          const isCorrect = submitted && correct;
          const isWrong = submitted && userAnswer.trim() !== "" && !correct;

          return (
            <div
              key={i}
              className="rounded-lg border p-4 transition-colors"
              style={{
                borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "transparent",
              }}
            >
              <p className="mb-1 text-sm font-medium">Question {i + 1}</p>

              <div className="rounded-lg bg-surface-alt px-4 py-3 text-base border border-border">
                <p>{q.prompt}</p>
              </div>

              <div className="mt-3">
                <label htmlFor={`trans-input-${i}`} className="text-xs font-medium text-text-secondary">
                  Rewrite starting with: <span className="font-semibold text-text">"{q.startWith}"</span>
                </label>
                <input
                  id={`trans-input-${i}`}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => handleChange(i, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className="mt-1 w-full min-h-11 rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-60"
                  style={{
                    borderColor: isCorrect ? "var(--correct)" : isWrong ? "var(--incorrect)" : "var(--border)",
                    background: isCorrect ? "var(--correct-bg)" : isWrong ? "var(--incorrect-bg)" : "transparent",
                  }}
                />
              </div>

              {!submitted && q.hint && (
                <p className="mt-1 text-xs text-text-muted italic">💡 {q.hint}</p>
              )}

              {submitted && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <p className="text-sm" style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
                    {isCorrect ? "Correct!" : `Answer: ${q.correct[0]}`}
                  </p>
                  <p className="text-xs text-text-secondary">{q.explanation}</p>
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
          className="mt-6 w-full min-h-11 rounded-full px-6 py-3 font-semibold text-white transition-opacity disabled:opacity-40 active-scale"
          style={{ background: allAnswered ? "var(--a1)" : "var(--border)" }}
        >
          Check Answers
        </button>
      ) : (
        <div className="mt-6 rounded-lg p-4 text-center animate-fade-in" style={{ background: score >= questions.length * 0.7 ? "var(--correct-bg)" : "var(--incorrect-bg)" }}>
          <p className="text-xl font-bold">{score}/{questions.length} correct ({Math.round((score / questions.length) * 100)}%)</p>
        </div>
      )}
    </div>
  );
}