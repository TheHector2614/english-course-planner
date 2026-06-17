import { useState, useCallback } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";

interface DictationItem {
  text: string;
  hint?: string;
}

interface Props {
  title?: string;
  items: DictationItem[];
  level?: string;
}

export default function Dictation({ title, items, level }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const currentItem = items[currentIdx];

  const speak = useCallback((text: string, speed = 0.6) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.lang = "en-US";
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const speakSlow = () => speak(currentItem.text, 0.5);
  const speakNormal = () => speak(currentItem.text, 0.75);

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = normalize(userInput) === normalize(currentItem.text);
    setResults((prev) => ({ ...prev, [currentIdx]: isCorrect }));
  };

  const handleNext = () => {
    if (currentIdx < items.length - 1) {
      setCurrentIdx((i) => i + 1);
      setUserInput("");
      setSubmitted(false);
    } else {
      setShowResults(true);
      if (level) addXP(XP_PER_EXERCISE, "dictation");
      updateChallengeProgress("daily_dictation", 1);
      updateChallengeProgress("weekly_all_exercises", 1);
    }
  };

  const isCorrect = submitted && normalize(userInput) === normalize(currentItem.text);

  if (showResults) {
    const correctCount = Object.values(results).filter(Boolean).length;
    return (
      <div className="animate-fade-in-scale rounded-xl shadow-border bg-surface p-8 text-center">
        <h3 className="text-xl font-bold font-display">Dictation Complete!</h3>
        <p className="mt-2 text-text-secondary">
          {correctCount}/{items.length} correct ({Math.round((correctCount / items.length) * 100)}%)
        </p>
        <button
          onClick={() => { setCurrentIdx(0); setResults({}); setShowResults(false); setUserInput(""); setSubmitted(false); }}
          className="mt-4 min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface"
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
        <span>{currentIdx + 1} / {items.length}</span>
        <div className="h-1.5 flex-1 mx-4 rounded-full bg-surface-alt overflow-hidden">
          <div className="h-full rounded-full bg-text transition-all" style={{ width: `${(currentIdx / items.length) * 100}%` }} />
        </div>
      </div>

      {/* Audio controls */}
      <div className="rounded-xl bg-surface-alt p-6 text-center">
        <div className="mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M16 7.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          {playing ? "Playing..." : "Listen and type what you hear"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={speakSlow}
            disabled={playing}
            className="flex items-center gap-2 min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z" /></svg>
            Play Slow
          </button>
          <button
            onClick={speakNormal}
            disabled={playing}
            className="flex items-center gap-2 min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z" /></svg>
            Play Normal
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="mt-4">
        <textarea
          value={userInput}
          onChange={(e) => { if (!submitted) setUserInput(e.target.value); }}
          disabled={submitted}
          placeholder="Type what you hear..."
          rows={3}
          className="w-full rounded-xl border p-4 text-base outline-none transition-colors disabled:opacity-60"
          aria-label="Dictation input"
          style={{
            borderColor: submitted ? (isCorrect ? "var(--correct)" : "var(--incorrect)") : "var(--border)",
            background: submitted ? (isCorrect ? "var(--correct-bg)" : "var(--incorrect-bg)") : "var(--surface-alt)",
          }}
        />
      </div>

      {/* Hint */}
      {currentItem.hint && !submitted && (
        <p className="mt-2 text-xs text-text-muted text-center">{currentItem.hint}</p>
      )}

      {/* Result */}
      {submitted && (
        <div className="mt-3 animate-fade-in rounded-lg p-3 text-center" style={{
          background: isCorrect ? "var(--correct-bg)" : "var(--incorrect-bg)",
        }}>
          <p className="text-sm font-medium" style={{ color: isCorrect ? "var(--correct)" : "var(--incorrect)" }}>
            {isCorrect ? "Correct!" : `Expected: "${currentItem.text}"`}
          </p>
          {!isCorrect && (
            <p className="mt-1 text-xs text-text-muted">You wrote: "{userInput}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex justify-center gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            Check
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
          >
            {currentIdx < items.length - 1 ? "Next" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}