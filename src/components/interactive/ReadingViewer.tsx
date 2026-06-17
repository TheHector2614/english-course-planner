import React, { useState, useCallback, useRef, useEffect } from "react";
import { saveWord } from "../../stores/vocabulary";
import { addXP, XP_PER_STORY } from "../../stores/progress";
import { db } from "../../stores/db";

interface Story {
  id: string;
  title: string;
  level: string;
  content: string;
  words: number;
  comprehensionQs: { question: string; options: string[]; correct: number }[];
  vocabulary: { word: string; definition: string; example?: string }[];
}

export default function ReadingViewer({ story }: { story: Story }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; def: string; example?: string } | null>(null);
  const [completing, setCompleting] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const contentRef = useRef<HTMLDivElement>(null);

  const wordsPerPage = story.level.startsWith("a")
    ? Math.ceil(story.words / 3)
    : Math.ceil(story.words / 2);
  const totalPages = Math.ceil(story.words / wordsPerPage);

  const pages = Array.from({ length: totalPages }, (_, i) => {
    const words = story.content.split(" ");
    const start = i * wordsPerPage;
    const end = Math.min(start + wordsPerPage, words.length);
    return words.slice(start, end).join(" ");
  });

  const handleWordClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "SPAN" && target.dataset.word) {
      const word = target.dataset.word;
      const vocab = story.vocabulary.find(
        (v) => v.word.toLowerCase() === word.toLowerCase()
      );
      if (vocab) {
        setSelectedWord(vocab);
      }
    }
  }, [story.vocabulary]);

  const handleSaveFromStory = async () => {
    if (!selectedWord) return;
    await saveWord({
      word: selectedWord.word,
      definition: selectedWord.def,
      example: selectedWord.example,
      level: story.level,
      tags: ["reading", story.level],
    });
    setSelectedWord(null);
  };

  const handleComplete = async () => {
    setCompleting(true);
    let correct = 0;
    story.comprehensionQs.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setShowResults(true);
    setCompleted(true);
    await addXP(XP_PER_STORY, "reading");

    // Save progress
    await db.stories.put({
      storyId: story.id,
      level: story.level,
      completed: true,
      comprehensionScore: correct,
      lastReadPosition: 0,
      vocabularySaved: [],
      completedAt: Date.now(),
    });
  };

  const speakWord = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div class="space-y-6">
      {/* Controls */}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl shadow-border p-4">
        <div class="flex items-center gap-2">
          <button
            onClick={() => setFontSize((f) => Math.max(14, f - 2))}
            class="rounded-lg bg-surface-alt px-2 py-1 text-xs hover:bg-border"
            aria-label="Decrease font size"
          >
            A-
          </button>
          <span class="text-xs text-text-muted">{fontSize}px</span>
          <button
            onClick={() => setFontSize((f) => Math.min(24, f + 2))}
            class="rounded-lg bg-surface-alt px-2 py-1 text-xs hover:bg-border"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => setShowTranslation(e.target.checked)}
            />
            Translation mode
          </label>
        </div>
        <span class="text-xs text-text-muted">
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        class="prose prose-sm max-w-none rounded-xl shadow-border bg-surface p-6 md:p-8"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        onClick={handleWordClick}
      >
        <p>
          {pages[currentPage].split(" ").map((w, i) => {
            const isVocab = story.vocabulary.some(
              (v) => v.word.toLowerCase() === w.replace(/[^a-zA-Z]/g, "").toLowerCase()
            );
            const clean = w.replace(/[^a-zA-Z]/g, "");
            return (
              <span
                key={i}
                data-word={clean}
                class={isVocab ? "cursor-pointer border-b-2 border-dotted border-a1 transition-colors hover:bg-a1-bg" : ""}
                onClick={() => isVocab && speakWord(w)}
              >
                {w}{" "}
              </span>
            );
          })}
        </p>
      </div>

      {/* Navigation */}
      <div class="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          class="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>

        <div class="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              class={`h-2 w-2 rounded-full transition-all ${
                i === currentPage ? "w-6 bg-text" : "bg-border hover:bg-text-muted"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        {currentPage < totalPages - 1 ? (
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            class="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ) : (
          !completed && (
            <button
              onClick={() => setCompleting(true)}
              class="rounded-lg bg-text px-5 py-2 text-sm font-semibold text-surface transition-all hover:opacity-90"
            >
              Complete Reading
            </button>
          )
        )}
      </div>

      {/* Word Tooltip */}
      {selectedWord && (
        <div class="animate-fade-in-up rounded-xl shadow-border bg-surface-raised p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{selectedWord.word}</span>
                <button
                  onClick={() => speakWord(selectedWord.word)}
                  class="rounded p-1 text-text-muted transition-colors hover:text-text"
                  aria-label="Listen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-text-secondary">{selectedWord.def}</p>
              {selectedWord.example && (
                <p class="mt-1 text-xs italic text-text-muted">"{selectedWord.example}"</p>
              )}
            </div>
            <button
              onClick={handleSaveFromStory}
              class="shrink-0 rounded-lg bg-text px-3 py-1.5 text-xs font-medium text-surface transition-all hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Comprehension Questions */}
      {completing && !showResults && (
        <div class="animate-fade-in-up space-y-5 rounded-xl shadow-border p-6">
          <h3 class="text-lg font-semibold font-display">Comprehension Check</h3>
          {story.comprehensionQs.map((q, qi) => (
            <div key={qi}>
              <p class="mb-2 text-sm font-medium">{qi + 1}. {q.question}</p>
              <div class="space-y-1">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[qi] = oi;
                      setAnswers(newAnswers);
                    }}
                    class={`w-full rounded-lg border px-4 py-2 text-left text-sm transition-all ${
                      answers[qi] === oi
                        ? "border-text bg-text/5 font-medium"
                        : "border-border hover:bg-surface-alt"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleComplete}
            disabled={answers.length < story.comprehensionQs.length}
            class="w-full rounded-xl bg-text px-5 py-3 text-sm font-semibold text-surface transition-all hover:opacity-90 disabled:opacity-40"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div class="animate-fade-in-scale rounded-xl shadow-border p-6 text-center">
          <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{
            background: score >= story.comprehensionQs.length / 2 ? "var(--correct)" : "var(--incorrect)",
            opacity: 0.1,
          }}>
            <span class="text-2xl">{score >= story.comprehensionQs.length / 2 ? "✓" : "×"}</span>
          </div>
          <h3 class="text-xl font-bold font-display">
            {score >= story.comprehensionQs.length / 2 ? "Well done!" : "Keep reading!"}
          </h3>
          <p class="mt-1 text-text-secondary">
            You scored <strong>{score}/{story.comprehensionQs.length}</strong>
          </p>
          <p class="mt-1 text-xs text-text-muted">+{XP_PER_STORY} XP earned</p>
        </div>
      )}
    </div>
  );
}
