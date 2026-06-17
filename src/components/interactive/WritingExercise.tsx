import { useState } from "react";
import { addXP } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";

interface Props {
  prompt: string;
  minWords: number;
  maxWords: number;
  level?: string;
}

export default function WritingExercise({ prompt, minWords, maxWords, level }: Props) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValid = wordCount >= minWords && wordCount <= maxWords;
  const isOver = wordCount > maxWords;

  const handleSubmit = () => {
    setSubmitted(true);
    if (level) {
      const xpGain = Math.min(30, 10 + Math.floor(wordCount / 10) * 5);
      addXP(xpGain, "writing");
    }
    updateChallengeProgress("daily_complete_exercises", 1);
    updateChallengeProgress("weekly_exercises", 1);
  };

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      <p className="mb-4 text-sm font-medium text-text-secondary">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => { if (!submitted) setText(e.currentTarget.value); }}
        disabled={submitted}
        className="min-h-[200px] w-full rounded-lg border border-border bg-surface-alt p-4 text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
        placeholder="Write your response here..."
        aria-label="Writing exercise response"
      />
      <div className="mt-3 flex items-center justify-between text-sm">
        <span
          style={{
            color: isValid ? "var(--correct)" : isOver ? "var(--incorrect)" : "var(--text-muted)",
          }}
        >
          {wordCount} words
          {wordCount < minWords && ` (min ${minWords})`}
          {isOver && ` (max ${maxWords})`}
        </span>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-40 active-scale"
          >
            Submit
          </button>
        ) : (
          <span className="text-correct font-medium">Submitted!</span>
        )}
      </div>
    </div>
  );
}
