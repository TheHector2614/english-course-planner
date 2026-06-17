import { useState } from "react";

interface Props {
  prompt: string;
  minWords: number;
  maxWords: number;
}

export default function WritingExercise({ prompt, minWords, maxWords }: Props) {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValid = wordCount >= minWords && wordCount <= maxWords;

  return (
    <div class="rounded-xl shadow-border bg-surface p-6">
      <p class="mb-4 text-sm font-medium text-text-secondary">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        class="min-h-200px w-full rounded-lg border border-border bg-surface-alt p-4 text-sm focus:outline-none focus:ring-2"
        placeholder="Write your response here..."
      />
      <div class="mt-3 flex items-center justify-between text-sm">
        <span
          style={{
            color: isValid ? "var(--correct)" : wordCount > maxWords ? "var(--incorrect)" : "var(--text-muted)",
          }}
        >
          {wordCount} words
          {wordCount < minWords && ` (min ${minWords})`}
          {wordCount > maxWords && ` (max ${maxWords})`}
        </span>
        {isValid && <span style={{ color: "var(--correct)" }}>✓ Ready for review</span>}
      </div>
    </div>
  );
}
