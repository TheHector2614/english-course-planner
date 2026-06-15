import { useState, useEffect, useCallback } from "react";
import { getDueWords, reviewWord } from "../../stores/vocabulary";
import { addXP, XP_PER_WORD } from "../../stores/progress";
import type { SavedWord } from "../../stores/db";

interface Card {
  front: string;
  back: string;
  example?: string;
}

interface Props {
  cards?: Card[];
  level?: string;
  useSm2?: boolean;
}

export default function FlashcardDeck({ cards: staticCards, level, useSm2 }: Props) {
  const [mode, setMode] = useState<"browse" | "study">("browse");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sm2Cards, setSm2Cards] = useState<SavedWord[]>([]);
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [animating, setAnimating] = useState(false);
  const [studyHistory, setStudyHistory] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (useSm2) {
      getDueWords().then((words) => {
        setSm2Cards(words);
        setStudyCards(words.map((w) => ({
          front: w.word,
          back: w.definition,
          example: w.example,
        })));
      });
    } else if (staticCards) {
      setStudyCards(staticCards);
    }
  }, [useSm2, staticCards]);

  const currentCard = studyCards[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < studyCards.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setFlipped(false);
        setAnimating(false);
      }, 150);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, studyCards.length]);

  const handleRating = async (quality: number) => {
    if (useSm2 && sm2Cards[currentIndex]) {
      await reviewWord(sm2Cards[currentIndex].id!, quality);
    }

    setStats((prev) => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
    }));
    setStudyHistory((prev) => ({ ...prev, [currentIndex]: quality >= 3 }));

    if (quality >= 3) {
      await addXP(Math.round(XP_PER_WORD / 2), "flashcard_review");
    }

    goNext();
  };

  const reset = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setStats({ correct: 0, incorrect: 0 });
    setStudyHistory({});
    if (useSm2) {
      getDueWords().then((words) => {
        setSm2Cards(words);
        setStudyCards(words.map((w) => ({
          front: w.word,
          back: w.definition,
          example: w.example,
        })));
      });
    }
  };

  if (studyCards.length === 0) {
    return (
      <div class="rounded-xl border border-border p-12 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h3 class="font-semibold">No cards to review</h3>
        <p class="mt-1 text-sm text-text-secondary">
          {useSm2 ? "All caught up! Save new words from the Dictionary." : "No flashcards available for this level."}
        </p>
        {useSm2 && <a href="/dictionary" class="mt-4 inline-block rounded-full bg-text px-5 py-2 text-sm font-semibold text-surface">Go to Dictionary</a>}
      </div>
    );
  }

  if (completed) {
    const total = stats.correct + stats.incorrect;
    const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    return (
      <div class="animate-fade-in-scale rounded-xl border border-border p-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{
          background: pct >= 70 ? "var(--correct)" : "var(--incorrect)",
          opacity: 0.1,
        }}>
          <span class="text-2xl font-bold" style={{ color: pct >= 70 ? "var(--correct)" : "var(--incorrect)" }}>
            {pct >= 70 ? "A" : "B"}
          </span>
        </div>
        <h3 class="text-xl font-bold font-display">Review Complete!</h3>
        <p class="mt-2 text-text-secondary">
          {stats.correct} correct, {stats.incorrect} to review again
        </p>
        <div class="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-surface-alt">
          <div class="h-full rounded-full transition-all" style={{
            width: `${pct}%`,
            background: "var(--correct)",
          }} />
        </div>
        <button
          onClick={reset}
          class="mt-5 rounded-full bg-text px-6 py-2 text-sm font-semibold text-surface transition-all hover:opacity-90"
        >
          Study Again
        </button>
      </div>
    );
  }

  if (mode === "study") {
    return (
      <div class="space-y-6">
        {/* Progress */}
        <div class="flex items-center justify-between text-sm text-text-muted">
          <span>{currentIndex + 1} / {studyCards.length}</span>
          <span class="tabular-nums">{Math.round(((currentIndex) / studyCards.length) * 100)}%</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-surface-alt">
          <div class="h-full rounded-full bg-text transition-all duration-300" style={{ width: `${(currentIndex / studyCards.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div
          class={`relative mx-auto h-56 w-full max-w-md cursor-pointer rounded-xl border-2 bg-surface p-6 shadow-md transition-all ${
            animating ? "opacity-0 scale-95" : "animate-fade-in-scale opacity-100"
          } ${flipped ? "border-a1" : "border-border"}`}
          style={{ perspective: "800px" }}
          onClick={() => setFlipped(!flipped)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(!flipped); } }}
          aria-label={flipped ? `Definition: ${currentCard.back}` : `Word: ${currentCard.front}. Tap to flip.`}
        >
          <div
            class="relative h-full w-full transition-transform duration-500 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div class="absolute inset-0 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: "hidden" }}>
              <p class="text-2xl font-bold font-display">{currentCard.front}</p>
              <p class="mt-3 text-xs text-text-muted">Tap to reveal</p>
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center backface-hidden p-4" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
              <p class="text-xl font-semibold">{currentCard.back}</p>
              {currentCard.example && (
                <p class="mt-2 text-sm text-text-secondary italic text-center">"{currentCard.example}"</p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(currentCard.front + ". " + currentCard.back);
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                class="mt-3 flex items-center gap-1 rounded-full bg-surface-alt px-3 py-1 text-xs text-text-secondary"
                aria-label="Listen to pronunciation"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>
                Listen
              </button>
            </div>
          </div>
        </div>

        {/* Rating buttons (shown after flip) */}
        {flipped && (
          <div class="flex justify-center gap-2 animate-fade-in-up">
            {[
              { label: "Forgot", quality: 1, color: "var(--incorrect)" },
              { label: "Hard", quality: 2, color: "var(--warning)" },
              { label: "Good", quality: 3, color: "var(--a2)" },
              { label: "Easy", quality: 5, color: "var(--correct)" },
            ].map((opt) => (
              <button
                key={opt.quality}
                onClick={() => handleRating(opt.quality)}
                class="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: opt.color }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div class="flex justify-between text-xs text-text-muted">
          <span>Correct: {stats.correct}</span>
          <button onClick={() => setMode("browse")} class="underline hover:text-text">Browse all cards</button>
          <span>Review: {stats.incorrect}</span>
        </div>
      </div>
    );
  }

  // Browse mode
  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-text-muted">{studyCards.length} cards</span>
        <button
          onClick={() => { setCurrentIndex(0); setFlipped(false); setMode("study"); }}
          class="rounded-full bg-text px-4 py-1.5 text-sm font-semibold text-surface transition-all hover:opacity-90"
        >
          Study Mode
        </button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {studyCards.map((card, i) => (
          <button
            key={i}
            onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
            class="group relative h-44 w-full cursor-pointer rounded-xl border-2 border-border bg-surface p-4 text-center shadow-sm transition-all hover:shadow-md"
            style={{ perspective: "800px" }}
            aria-label={flipped[i] ? `Definition: ${card.back}` : `Word: ${card.front}`}
          >
            <div
              class="relative h-full w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div class="absolute inset-0 flex flex-col items-center justify-center backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                <p class="text-lg font-bold">{card.front}</p>
                <p class="mt-1 text-xs text-text-muted">Tap to flip</p>
              </div>
              <div class="absolute inset-0 flex flex-col items-center justify-center backface-hidden" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                <p class="text-base font-semibold">{card.back}</p>
                {card.example && <p class="mt-2 text-xs text-text-secondary italic px-2">{card.example}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
