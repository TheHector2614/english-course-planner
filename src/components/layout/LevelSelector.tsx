import { useState, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { levelMode, setLevelMode } from "../../stores/modes";
import type { LevelMode } from "../../stores/modes";
import { LEVELS } from "../../data/levels";
import { ErrorBoundary } from "../interactive/ErrorBoundary";

function LevelSelectorInner() {
  const currentLevel = useStore(levelMode);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const levels = LEVELS.map((l) => ({
    id: l.id as LevelMode,
    label: l.name,
    desc: l.label,
    color: l.color,
  }));

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const currentIdx = levels.findIndex((l) => l.id === currentLevel);
      setFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, currentLevel, levels]);

  useEffect(() => {
    if (focusedIndex >= 0 && optionsRefs.current[focusedIndex]) {
      optionsRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleLevelSelect = (levelId: LevelMode) => {
    setLevelMode(levelId);
    setIsOpen(false);
    
    // If we are on a level details page, redirect to the new level page
    if (window.location.pathname.startsWith("/level/")) {
      window.location.href = `/level/${levelId}`;
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % levels.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + levels.length) % levels.length);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLevelSelect(levels[index].id);
      triggerRef.current?.focus();
    }
  };

  const currentLevelInfo = levels.find((l) => l.id === currentLevel) || levels[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-bold transition-all hover:bg-surface-alt active-scale focus-visible:ring-2 focus-visible:ring-a1"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="level-listbox"
        aria-label={`Select level, current level is ${currentLevelInfo.label}`}
      >
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: `var(--${currentLevelInfo.color})` }}
        />
        <span>Level: {currentLevelInfo.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="level-listbox"
          role="listbox"
          aria-label="Select CEFR Level"
          className="absolute right-0 mt-2.5 z-50 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-2xl animate-fade-in-scale"
        >
          <p className="px-3 py-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Select Your Level
          </p>
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {levels.map((l, idx) => (
              <button
                key={l.id}
                ref={(el) => {
                  optionsRefs.current[idx] = el;
                }}
                onClick={() => handleLevelSelect(l.id)}
                onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                role="option"
                aria-selected={currentLevel === l.id}
                tabIndex={0}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-all outline-none focus:bg-surface-alt hover:bg-surface-alt ${
                  currentLevel === l.id
                    ? "bg-surface-alt text-text"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: `var(--${l.color})` }}
                  />
                  <div>
                    <p className="text-xs font-bold">{l.label}</p>
                    <p className="text-[10px] font-medium text-text-muted">{l.desc}</p>
                  </div>
                </div>
                {currentLevel === l.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`var(--${l.color})`} strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border mt-1.5 pt-1.5 px-1.5">
            <a
              href={`/level/${currentLevel}`}
              className="flex w-full items-center justify-center min-h-9 gap-1 rounded-lg bg-text text-surface text-center py-2 text-xs font-bold hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-a1"
            >
              Go to level page
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LevelSelector() {
  return (
    <ErrorBoundary fallbackTitle="Level Selector Error">
      <LevelSelectorInner />
    </ErrorBoundary>
  );
}
