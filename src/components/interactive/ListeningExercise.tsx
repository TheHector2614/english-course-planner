import { useState, useCallback } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";

interface ListeningQuestion {
  text: string;
  question: string;
  options: string[];
  correct: number;
}

interface Props {
  title?: string;
  questions: ListeningQuestion[];
  level?: string;
}

export default function ListeningExercise({ title, questions, level }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[currentIdx];

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.lang = "en-US";
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = selectedAnswer === currentQ.correct;
    setResults((prev) => ({ ...prev, [currentIdx]: isCorrect }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    } else {
      setShowResults(true);
      if (level) addXP(XP_PER_EXERCISE, "listening");
    }
  };

  if (showResults) {
    const correctCount = Object.values(results).filter(Boolean).length;
    return (
      <div className="animate-fade-in-scale rounded-xl shadow-border bg-surface p-8 text-center">
        <h3 className="text-xl font-bold font-display">Listening Complete!</h3>
        <p className="mt-2 text-text-secondary">
          {correctCount}/{questions.length} correct ({Math.round((correctCount / questions.length) * 100)}%)
        </p>
        <button
          onClick={() => { setCurrentIdx(0); setResults({}); setShowResults(false); setSelectedAnswer(null); setSubmitted(false); }}
          className="mt-4 rounded-full bg-text px-5 py-2 text-sm font-semibold text-surface"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div className="mb-4 flex items-center justify-between text-sm text-text-muted">
        <span>{currentIdx + 1} / {questions.length}</span>
        <div className="h-1.5 flex-1 mx-4 rounded-full bg-surface-alt overflow-hidden">
          <div className="h-full rounded-full bg-text transition-all" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Audio player */}
      <div className="rounded-xl bg-surface-alt p-6 text-center mb-5">
        <button
          onClick={() => speak(currentQ.text)}
          disabled={playing}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all"
          style={{ background: playing ? "var(--a1)" : "var(--text)" }}
          aria-label={playing ? "Playing" : "Play audio"}
        >
          {playing ? (
            <span className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <span key={i} className="h-4 w-1 animate-pulse rounded-full bg-white" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--surface)">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <p className="mt-3 text-sm text-text-secondary">{playing ? "Listening..." : "Tap to listen"}</p>
      </div>

      {/* Question */}
      <p className="mb-3 text-base font-medium">{currentQ.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrectOpt = submitted && i === currentQ.correct;
          const isWrongOpt = submitted && isSelected && i !== currentQ.correct;

          return (
            <button
              key={i}
              onClick={() => { if (!submitted) setSelectedAnswer(i); }}
              disabled={submitted}
              className="w-full rounded-lg border px-4 py-3 text-left text-sm transition-all disabled:cursor-default"
              style={{
                borderColor: isCorrectOpt ? "var(--correct)" : isWrongOpt ? "var(--incorrect)" : isSelected ? "var(--a1)" : "var(--border)",
                background: isCorrectOpt ? "var(--correct-bg)" : isWrongOpt ? "var(--incorrect-bg)" : isSelected ? "var(--a1-bg)" : "transparent",
              }}
            >
              <span className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                  style={{
                    background: isCorrectOpt ? "var(--correct)" : isSelected ? "var(--a1)" : "var(--surface-alt)",
                    color: isCorrectOpt || isSelected ? "var(--surface)" : "var(--text-secondary)",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-5 flex justify-center">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="rounded-full bg-text px-6 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-full bg-text px-6 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
          >
            {currentIdx < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>

      {/* Explanation */}
      {submitted && selectedAnswer !== currentQ.correct && (
        <p className="mt-3 text-center text-xs text-text-muted">
          Listen again and pay attention to the key details.
        </p>
      )}
    </div>
  );
}