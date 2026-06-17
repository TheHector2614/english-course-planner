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
import { exportJSON, exportCSV, exportHTMLFlashcards, printVocabulary } from "../../utils/export";
import { ErrorBoundary } from "./ErrorBoundary";

function VocabularyBuilderInner() {
  const words = useStore(vocabularyList);
  const loading = useStore(vocabularyLoading);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "nextReview" | "word">("recent");
  const [dueWords, setDueWords] = useState<SavedWord[]>([]);
  const [reviewing, setReviewing] = useState<SavedWord | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    let active = true;
    getDueWords().then((res) => {
      if (active) setDueWords(res);
    });
    return () => {
      active = false;
    };
  }, [words]);

  useEffect(() => {
    if (!showReview || !reviewing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowReview(false);
      } else if (e.key === "1") {
        handleReview(reviewing, 1);
      } else if (e.key === "2") {
        handleReview(reviewing, 2);
      } else if (e.key === "3") {
        handleReview(reviewing, 3);
      } else if (e.key === "4" || e.key === "5") {
        handleReview(reviewing, 5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showReview, reviewing]);

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl shadow-border p-5">
            <div className="h-5 w-1/4 rounded bg-surface-alt" />
            <div className="mt-2 h-4 w-3/4 rounded bg-surface-alt" />
          </div>
        ))}
      </div>
    );
  }

  if (wordList.length === 0) {
    return (
      <div className="rounded-xl shadow-border p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No words saved yet</h3>
        <p className="mt-1 text-sm text-text-secondary">Use the Dictionary to look up words and save them here.</p>
        <a href="/dictionary" className="mt-4 inline-flex items-center gap-2 rounded-full bg-text px-5 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale">
          Go to Dictionary
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {[
          { label: "Total", value: stats.total, color: "a1" },
          { label: "Due for Review", value: stats.due, color: "incorrect" },
          { label: "Mastered", value: stats.mastered, color: "correct" },
          { label: "Learning", value: stats.learning, color: "warning" },
          { label: "New", value: stats.new, color: "a2" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-[var(--radius-lg)] p-4 text-center transition-all hover:-translate-y-0.5 duration-300" style={{ borderBottom: `3px solid var(--${s.color})` }}>
            <p className="text-2xl font-black font-display tracking-tight tabular-nums" style={{ color: `var(--${s.color})` }}>{s.value}</p>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "due", label: "Due" },
            { id: "a1", label: "A1" },
            { id: "a2", label: "A2" },
            { id: "b1", label: "B1" },
            { id: "b1+", label: "B1+" },
            { id: "b2", label: "B2" },
            { id: "b2+", label: "B2+" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4.5 py-1.5 text-xs font-bold transition-all active-scale ${
                filter === f.id ? "bg-text text-surface shadow-md" : "bg-surface-alt border border-border text-text-secondary hover:bg-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <button onClick={() => setShowExport((v) => !v)} className="w-full min-h-11 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-alt transition-all active-scale flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
            {showExport && <div className="fixed inset-0 z-20" onClick={() => setShowExport(false)} />}
            {showExport && (
              <div className="absolute right-0 top-full mt-2.5 z-30 min-w-[200px] rounded-xl border border-border bg-surface p-1.5 shadow-2xl animate-fade-in-scale">
                <button onClick={() => { exportJSON(wordList); setShowExport(false); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                  JSON
                </button>
                <button onClick={() => { exportCSV(wordList); setShowExport(false); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                  CSV
                </button>
                <button onClick={() => { exportHTMLFlashcards(wordList); setShowExport(false); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                  Flashcards (HTML)
                </button>
                <button onClick={() => { printVocabulary(wordList); setShowExport(false); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                  Print List
                </button>
              </div>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="flex-1 sm:flex-initial rounded-lg border border-border bg-surface p-2.5 text-xs font-semibold outline-none transition-all focus:border-a1 focus:ring-2 focus:ring-a1-bg min-h-11"
            aria-label="Sort by"
          >
            <option value="recent">Most Recent</option>
            <option value="nextReview">Due Date</option>
            <option value="word">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && reviewing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-surface/40 backdrop-blur-md" onClick={() => setShowReview(false)}>
          <div className="mx-4 w-full max-w-md animate-fade-in-scale rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowReview(false)} className="text-text-muted hover:text-text p-1 transition-colors" aria-label="Close review">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <span className="inline-block rounded-full bg-a2-bg px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-a2" style={{ border: "1px solid color-mix(in oklch, var(--a2) 20%, transparent)" }}>Review Card</span>
            <h3 className="text-2xl font-black font-display mt-3 text-text tracking-tight">{reviewing.word}</h3>
            {reviewing.phonetic && <p className="text-sm font-mono text-text-muted mt-1">{reviewing.phonetic}</p>}
            <p className="mt-4 text-base text-text leading-relaxed font-medium">{reviewing.definition}</p>
            {reviewing.example && <p className="mt-3 text-sm italic text-text-secondary border-l-2 border-border-light pl-3">"{reviewing.example}"</p>}
            <p className="mt-6 text-xs font-bold text-text-muted uppercase tracking-wider">How well did you remember?</p>
            <div className="mt-2.5 flex gap-2">
              {[
                { label: "Forgot", quality: 1, color: "incorrect" },
                { label: "Hard", quality: 2, color: "warning" },
                { label: "Good", quality: 3, color: "a2" },
                { label: "Easy", quality: 5, color: "correct" },
              ].map((opt) => (
                <button
                  key={opt.quality}
                  onClick={() => handleReview(reviewing, opt.quality)}
                  className="min-h-11 flex-1 rounded-lg px-3 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:brightness-95 active-scale"
                  style={{ 
                    background: `color-mix(in oklch, var(--${opt.color}) 18%, transparent)`, 
                    color: `var(--${opt.color})`,
                    border: `1px solid color-mix(in oklch, var(--${opt.color}) 30%, transparent)`
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Word List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">No words match this filter.</p>
        )}
        {filtered.map((w) => {
          const isDue = w.nextReview <= Date.now() && w.repetitions < 5;
          const cardStyle = isDue
            ? {
                border: "1px solid color-mix(in oklch, var(--warning) 35%, transparent)",
                background: "color-mix(in oklch, var(--warning) 6%, transparent)",
                boxShadow: "0 4px 12px -2px color-mix(in oklch, var(--warning) 15%, transparent)"
              }
            : undefined;

          return (
            <div
              key={w.id}
              className={`animate-fade-in-up group flex items-start justify-between rounded-[var(--radius-lg)] p-4.5 transition-all duration-300 glass-card glass-card-hover ${
                deleting === w.id ? "opacity-0 scale-95" : ""
              }`}
              style={cardStyle}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-text text-base">{w.word}</span>
                  {w.phonetic && <span className="text-xs text-text-muted font-mono">{w.phonetic}</span>}
                  {w.repetitions >= 5 && (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] text-correct font-bold uppercase tracking-wider bg-correct-bg" style={{ border: "1px solid color-mix(in oklch, var(--correct) 20%, transparent)" }}>Mastered</span>
                  )}
                  {w.repetitions === 0 && w.nextReview <= Date.now() && (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] text-warning font-bold uppercase tracking-wider bg-warning-bg" style={{ border: "1px solid color-mix(in oklch, var(--warning) 20%, transparent)" }}>New</span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed line-clamp-2">{w.definition}</p>
                {w.example && <p className="mt-1 text-xs italic text-text-muted truncate">"{w.example}"</p>}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: `var(--${w.level}-bg)`, color: `var(--${w.level})` }}>
                    {w.level.toUpperCase()}
                  </span>
                  {w.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface-alt border border-border-light px-2.5 py-0.5 text-[10px] font-bold text-text-secondary">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 ml-4">
                <button
                  onClick={() => { setReviewing(w); setShowReview(true); }}
                  className="rounded-lg p-2.5 text-text-secondary transition-all hover:bg-a2-bg hover:text-a2 active-scale min-h-11 min-w-11 flex items-center justify-center border border-transparent hover:border-border"
                  aria-label="Review this word"
                  title="Review"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button
                  onClick={() => w.id && handleDelete(w.id)}
                  className="rounded-lg p-2.5 text-text-muted transition-all hover:bg-incorrect/15 hover:text-incorrect active-scale min-h-11 min-w-11 flex items-center justify-center border border-transparent hover:border-border"
                  aria-label="Delete word"
                  title="Delete"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VocabularyBuilder() {
  return (
    <ErrorBoundary fallbackTitle="Vocabulary Builder Error">
      <VocabularyBuilderInner />
    </ErrorBoundary>
  );
}
