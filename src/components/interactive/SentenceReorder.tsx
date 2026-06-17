import { useState, useEffect } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";

interface ReorderQuestion {
  words: string[];       // Mixed up words
  correct: string;       // The correct sentence
  hint?: string;
}

interface Props {
  title?: string;
  questions: ReorderQuestion[];
  level?: string;
}

export default function SentenceReorder({ title, questions, level }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[currentIdx];
  const allAnswered = Object.keys(results).length === questions.length;

  useEffect(() => {
    if (currentQ) {
      setShuffled([...currentQ.words].sort(() => Math.random() - 0.5));
      setSelected([]);
      setSubmitted(false);
    }
  }, [currentIdx, currentQ]);

  const addWordSimple = (idx: number) => {
    if (submitted) return;
    const word = shuffled[idx];
    setSelected((prev) => [...prev, word]);
    setShuffled((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeWord = (idx: number) => {
    if (submitted) return;
    const word = selected[idx];
    setShuffled((prev) => [...prev, word]);
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    setSubmitted(true);
    const isCorrect = selected.join(" ").toLowerCase() === currentQ.correct.toLowerCase();
    setResults((prev) => ({ ...prev, [currentIdx]: isCorrect }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResults(true);
      if (level) {
        addXP(XP_PER_EXERCISE, "sentence_reorder");
      }
    }
  };

  const isCorrect = submitted && selected.join(" ").toLowerCase() === currentQ.correct.toLowerCase();

  if (showResults) {
    const correctCount = Object.values(results).filter(Boolean).length;
    return (
      <div className="animate-fade-in-scale rounded-xl shadow-border bg-surface p-8 text-center">
        <h3 className="text-xl font-bold font-display">Exercise Complete!</h3>
        <p className="mt-2 text-text-secondary">
          {correctCount}/{questions.length} correct ({Math.round((correctCount / questions.length) * 100)}%)
        </p>
        <button
          onClick={() => { setCurrentIdx(0); setResults({}); setShowResults(false); }}
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
        <span>Question {currentIdx + 1} of {questions.length}</span>
        {currentQ.hint && <span>Hint: {currentQ.hint}</span>}
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-alt">
        <div className="h-full rounded-full bg-text transition-all" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
      </div>

      {/* Answer area */}
      <div className="min-h-[80px] rounded-xl border-2 border-dashed border-border bg-surface-alt p-4"
        style={{
          borderColor: submitted ? (isCorrect ? "var(--correct)" : "var(--incorrect)") : "var(--border)",
        }}
      >
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 && !submitted && (
            <span className="text-sm text-text-muted">Click words below to build the sentence...</span>
          )}
          {selected.map((word, i) => (
            <button
              key={i}
              onClick={() => removeWord(i)}
              disabled={submitted}
              className="min-h-11 rounded-lg bg-a1-bg px-4 py-2.5 text-sm font-medium text-a1 transition-colors hover:bg-a1-light disabled:cursor-default"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {shuffled.map((word, i) => (
            <button
              key={i}
              onClick={() => addWordSimple(i)}
              disabled={submitted}
              className="min-h-11 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm transition-colors hover:bg-surface-alt hover:border-text-muted disabled:opacity-30 disabled:cursor-default"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {submitted && (
        <div className="mt-4 animate-fade-in rounded-lg p-4" style={{
          background: isCorrect ? "var(--correct-bg)" : "var(--incorrect-bg)",
        }}>
          <p style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
            {isCorrect ? "Correct!" : `Answer: ${currentQ.correct}`}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => { setSelected([]); setShuffled([...currentQ.words].sort(() => Math.random() - 0.5)); }}
          disabled={submitted}
          className="min-h-11 rounded-lg px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-30 active-scale"
        >
          Reset
        </button>

        {!submitted ? (
          <button
            onClick={checkAnswer}
            disabled={selected.length === 0}
            className="min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            Check
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
          >
            {currentIdx < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
