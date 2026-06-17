import React, { useEffect, useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  vocabularyList,
  vocabularyLoading,
  loadVocabulary,
  reviewWord,
  deleteWord,
  getDueWords,
} from "../../stores/vocabulary";
import type { SavedWord } from "../../stores/db";

export default function VocabularyBuilder() {
  const words = useStore(vocabularyList);
  const loading = useStore(vocabularyLoading);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "nextReview" | "word">("recent");
  const [dueWords, setDueWords] = useState<SavedWord[]>([]);
  const [reviewing, setReviewing] = useState<SavedWord | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    getDueWords().then(setDueWords);
  }, [words]);

  const wordList = Object.values(words);

  const filtered = wordList
    .filter((w) => {
      if (filter === "all") return true;
      if (filter === "due") return w.nextReview <= Date.now();
      return w.level === filter;
    })
    .sort((a, b) => {
      if (sort === "recent") return b.savedAt - a.savedAt;
      if (sort === "nextReview") return a.nextReview - b.nextReview;
      return a.word.localeCompare(b.word);
    });

  const handleReview = async (word: SavedWord, quality: number) => {
    if (!word.id) return;
    await reviewWord(word.id, quality);
    setReviewing(null);
    setShowReview(false);
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    setTimeout(async () => {
      await deleteWord(id);
      setDeleting(null);
    }, 200);
  };

  const stats = {
    total: wordList.length,
    due: dueWords.length,
    mastered: wordList.filter((w) => w.repetitions >= 5).length,
    learning: wordList.filter((w) => w.repetitions > 0 && w.repetitions < 5).length,
    new: wordList.filter((w) => w.repetitions === 0).length,
  };

  if (loading) {
    return (
      <div class="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} class="animate-pulse rounded-xl shadow-border p-5">
            <div class="h-5 w-1/4 rounded bg-surface-alt" />
            <div class="mt-2 h-4 w-3/4 rounded bg-surface-alt" />
          </div>
        ))}
      </div>
    );
  }

  if (wordList.length === 0) {
    return (
      <div class="rounded-xl shadow-border p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold">No words saved yet</h3>
        <p class="mt-1 text-sm text-text-secondary">Use the Dictionary to look up words and save them here.</p>
        <a href="/dictionary" class="mt-4 inline-flex items-center gap-2 rounded-full bg-text px-5 py-2 text-sm font-semibold text-surface transition-all hover:opacity-90">
          Go to Dictionary
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Stats */}
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {[
          { label: "Total", value: stats.total, color: "a1" },
          { label: "Due for Review", value: stats.due, color: "incorrect" },
          { label: "Mastered", value: stats.mastered, color: "correct" },
          { label: "Learning", value: stats.learning, color: "warning" },
          { label: "New", value: stats.new, color: "a2" },
        ].map((s) => (
          <div key={s.label} class="rounded-xl shadow-border p-4 text-center" style={{ borderColor: `var(--${s.color})` }}>
            <p class="text-2xl font-bold font-display" style={{ color: `var(--${s.color})` }}>{s.value}</p>
            <p class="text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-1">
          {[
            { id: "all", label: "All" },
            { id: "due", label: "Due" },
            { id: "a1", label: "A1" },
            { id: "a2", label: "A2" },
            { id: "b1", label: "B1" },
            { id: "b2", label: "B2" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              class={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.id ? "bg-text text-surface" : "bg-surface-alt text-text-secondary hover:bg-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          class="ml-auto rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs outline-none"
          aria-label="Sort by"
        >
          <option value="recent">Most Recent</option>
          <option value="nextReview">Due Date</option>
          <option value="word">Alphabetical</option>
        </select>
      </div>

      {/* Review Modal */}
      {showReview && reviewing && (
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-surface/80 backdrop-blur-sm" onClick={() => setShowReview(false)}>
          <div class="mx-4 w-full max-w-md animate-fade-in-scale rounded-xl border border-border bg-surface-raised p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold font-display">Review: {reviewing.word}</h3>
            {reviewing.phonetic && <p class="text-sm text-text-muted">{reviewing.phonetic}</p>}
            <p class="mt-3 text-base">{reviewing.definition}</p>
            {reviewing.example && <p class="mt-2 text-sm italic text-text-secondary">"{reviewing.example}"</p>}
            <p class="mt-4 text-xs font-medium text-text-muted">How well did you remember?</p>
            <div class="mt-2 flex gap-2">
              {[
                { label: "Forgot", quality: 1, color: "incorrect" },
                { label: "Hard", quality: 2, color: "warning" },
                { label: "Good", quality: 3, color: "a2" },
                { label: "Easy", quality: 5, color: "correct" },
              ].map((opt) => (
                <button
                  key={opt.quality}
                  onClick={() => handleReview(reviewing, opt.quality)}
                  class={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80`}
                  style={{ background: `var(--${opt.color})`, color: "white" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReview(false)} class="mt-3 w-full text-center text-xs text-text-muted hover:text-text">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Word List */}
      <div class="space-y-2">
        {filtered.length === 0 && (
          <p class="py-8 text-center text-sm text-text-muted">No words match this filter.</p>
        )}
        {filtered.map((w) => (
          <div
            key={w.id}
            class={`animate-fade-in-up group flex items-start justify-between rounded-xl p-4 transition-all ${
              deleting === w.id ? "opacity-0 scale-95" : ""
            } ${w.nextReview <= Date.now() && w.repetitions < 5 ? "border border-warning/30 bg-warning/5" : "shadow-border"}`}
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold">{w.word}</span>
                {w.phonetic && <span class="text-xs text-text-muted">{w.phonetic}</span>}
                {w.repetitions >= 5 && (
                  <span class="rounded-full bg-correct/10 px-2 py-0.5 text-xs text-correct font-medium">Mastered</span>
                )}
                {w.repetitions === 0 && w.nextReview <= Date.now() && (
                  <span class="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning font-medium">New</span>
                )}
              </div>
              <p class="mt-0.5 text-sm text-text-secondary line-clamp-1">{w.definition}</p>
              {w.example && <p class="mt-0.5 text-xs italic text-text-muted truncate">"{w.example}"</p>}
              <div class="mt-1.5 flex items-center gap-2">
                <span class="rounded-full px-2 py-0.5 text-xs" style={{ background: `var(--${w.level}-bg)`, color: `var(--${w.level})` }}>
                  {w.level.toUpperCase()}
                </span>
                {w.tags.map((t) => (
                  <span key={t} class="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-text-muted">{t}</span>
                ))}
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1 ml-3">
              <button
                onClick={() => { setReviewing(w); setShowReview(true); }}
                class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
                aria-label="Review this word"
                title="Review"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                onClick={() => w.id && handleDelete(w.id)}
                class="rounded-lg p-2 text-text-muted transition-colors hover:bg-incorrect/10 hover:text-incorrect"
                aria-label="Delete word"
                title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
