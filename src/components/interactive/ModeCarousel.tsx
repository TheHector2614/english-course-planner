import { useRef, useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  levelMode,
  focusMode,
  setLevelMode,
  setFocusMode,
  LEVEL_LABELS,
  LEVEL_COLORS,
  FOCUS_LABELS,
  FOCUS_DESCS,
} from "../../stores/modes";
import type { LevelMode, FocusMode } from "../../stores/modes";

const LEVELS: LevelMode[] = ["a1", "a2", "b1", "b1+", "b2", "b2+"];
const FOCUSES: FocusMode[] = ["general", "business", "technology"];

const FOCUS_ICONS: Record<FocusMode, string> = {
  general:
    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  business:
    "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-6 2h-2m4 0h2m-2 2v4m-4-4h-2m4 0h2m-8 4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m12 14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4z",
  technology:
    "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
};

const LEVEL_IMAGES: Record<LevelMode, string> = {
  a1: "🌱",
  a2: "🌿",
  b1: "🌳",
  "b1+": "🔥",
  b2: "⚡",
  "b2+": "🌟",
};

interface Props {
  compact?: boolean;
}

function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  slideSelector: string
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const slides = el.querySelectorAll(slideSelector);
    if (!slides.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left);
        if (visible.length > 0) {
          const idx = Array.from(slides).indexOf(visible[0].target);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      { root: el, threshold: 0.6 }
    );

    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ref, slideSelector]);

  return activeIndex;
}

function ModeDots({ count, active, onChange }: { count: number; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Carousel dots">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          onClick={() => onChange(i)}
          className={`h-2 rounded-full transition-all active-scale ${
            i === active ? "w-6" : "w-2"
          }`}
          style={{
            background: i === active ? "var(--focus-accent)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

function LevelSlide({ level, isActive, onKeyDown }: { level: LevelMode; isActive: boolean; onKeyDown?: React.KeyboardEventHandler }) {
  const color = LEVEL_COLORS[level];
  return (
    <button
      onClick={() => setLevelMode(level)}
      onKeyDown={onKeyDown}
      role="tab"
      aria-selected={isActive}
      className={`flex shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all active-scale focus-visible:ring-2 focus-visible:ring-focus-accent ${
        isActive
          ? "border-focus-accent shadow-sm"
          : "border-border hover:border-border-light"
      }`}
      style={{
        minWidth: 140,
        height: 140,
        background: isActive ? "var(--focus-accent-bg)" : "var(--surface)",
      }}
    >
      <span className="text-3xl">{LEVEL_IMAGES[level]}</span>
      <span
        className="text-xl font-black font-display tracking-tight"
        style={{ color: `var(--${color})` }}
      >
        {level.toUpperCase()}
      </span>
      <span
        className={`text-xs font-medium ${isActive ? "" : "text-text-muted"}`}
        style={{ color: isActive ? "var(--focus-accent)" : undefined }}
      >
        {LEVEL_LABELS[level]}
      </span>
    </button>
  );
}

function FocusSlide({ focus, isActive, onKeyDown }: { focus: FocusMode; isActive: boolean; onKeyDown?: React.KeyboardEventHandler }) {
  return (
    <button
      onClick={() => setFocusMode(focus)}
      onKeyDown={onKeyDown}
      role="tab"
      aria-selected={isActive}
      className={`flex shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all active-scale focus-visible:ring-2 focus-visible:ring-focus-accent ${
        isActive
          ? "border-focus-accent shadow-sm"
          : "border-border hover:border-border-light"
      }`}
      style={{
        minWidth: 180,
        height: 160,
        background: isActive ? "var(--focus-accent-bg)" : "var(--surface)",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isActive ? "var(--focus-accent)" : "var(--text-muted)"}
        stroke-width="1.5"
        stroke-linecap="round"
      >
        <path d={FOCUS_ICONS[focus]} />
      </svg>
      <span className={`text-sm font-semibold ${isActive ? "" : "text-text-secondary"}`}>
        {FOCUS_LABELS[focus].split(" ")[0]}
      </span>
      <span className="text-[10px] text-text-muted leading-tight px-2 text-center">
        {FOCUS_DESCS[focus]}
      </span>
    </button>
  );
}

export default function ModeCarousel({ compact }: Props) {
  const currentLevel = useStore(levelMode);
  const currentFocus = useStore(focusMode);
  const levelScroller = useRef<HTMLDivElement>(null);
  const focusScroller = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  const levelIndex = LEVELS.indexOf(currentLevel);
  const focusIndex = FOCUSES.indexOf(currentFocus);

  // Track active via intersection
  const observedLevelIdx = useIntersectionObserver(levelScroller, "[data-level-slide]");
  const observedFocusIdx = useIntersectionObserver(focusScroller, "[data-focus-slide]");

  const scrollTo = useCallback(
    (scroller: React.RefObject<HTMLDivElement | null>, index: number) => {
      const el = scroller.current;
      if (!el) return;
      const slide = el.children[index] as HTMLElement;
      if (slide) {
        slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    },
    []
  );

  const handleLevelKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % LEVELS.length;
      setLevelMode(LEVELS[nextIdx]);
      scrollTo(levelScroller, nextIdx);
      setTimeout(() => {
        const slides = levelScroller.current?.querySelectorAll("button");
        (slides?.[nextIdx] as HTMLElement)?.focus();
      }, 50);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + LEVELS.length) % LEVELS.length;
      setLevelMode(LEVELS[prevIdx]);
      scrollTo(levelScroller, prevIdx);
      setTimeout(() => {
        const slides = levelScroller.current?.querySelectorAll("button");
        (slides?.[prevIdx] as HTMLElement)?.focus();
      }, 50);
    }
  }, [scrollTo]);

  const handleFocusKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % FOCUSES.length;
      setFocusMode(FOCUSES[nextIdx]);
      scrollTo(focusScroller, nextIdx);
      setTimeout(() => {
        const slides = focusScroller.current?.querySelectorAll("button");
        (slides?.[nextIdx] as HTMLElement)?.focus();
      }, 50);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + FOCUSES.length) % FOCUSES.length;
      setFocusMode(FOCUSES[prevIdx]);
      scrollTo(focusScroller, prevIdx);
      setTimeout(() => {
        const slides = focusScroller.current?.querySelectorAll("button");
        (slides?.[prevIdx] as HTMLElement)?.focus();
      }, 50);
    }
  }, [scrollTo]);

  // Drag handlers for non-touch desktop
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, scroller: React.RefObject<HTMLDivElement | null>) => {
      const el = scroller.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
      setDragStart({ x: e.clientX, scrollLeft: el.scrollLeft });
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent, scroller: React.RefObject<HTMLDivElement | null>) => {
      if (!dragging) return;
      const el = scroller.current;
      if (!el) return;
      el.scrollLeft = dragStart.scrollLeft - (e.clientX - dragStart.x);
    },
    [dragging, dragStart]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {/* Level Carousel */}
      <div>
        {!compact && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Your Level</h3>
            <span className="text-xs text-text-muted">Swipe or drag</span>
          </div>
        )}
        <div
          ref={levelScroller}
          onPointerDown={(e) => handlePointerDown(e, levelScroller)}
          onPointerMove={(e) => handlePointerMove(e, levelScroller)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 select-none"
          style={{ scrollbarWidth: "none", cursor: dragging ? "grabbing" : "grab", touchAction: "pan-x pinch-zoom" }}
          role="tablist"
          aria-label="Select your level"
        >
          {LEVELS.map((l, idx) => (
            <div key={l} data-level-slide>
              <LevelSlide level={l} isActive={l === currentLevel} onKeyDown={(e) => handleLevelKeyDown(e, idx)} />
            </div>
          ))}
        </div>
        <ModeDots
          count={LEVELS.length}
          active={observedLevelIdx}
          onChange={(i) => scrollTo(levelScroller, i)}
        />
      </div>

      {/* Focus Carousel */}
      <div>
        {!compact && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Your Focus</h3>
            <span className="text-xs text-text-muted">Swipe or drag</span>
          </div>
        )}
        <div
          ref={focusScroller}
          onPointerDown={(e) => handlePointerDown(e, focusScroller)}
          onPointerMove={(e) => handlePointerMove(e, focusScroller)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 select-none"
          style={{ scrollbarWidth: "none", cursor: dragging ? "grabbing" : "grab", touchAction: "pan-x pinch-zoom" }}
          role="tablist"
          aria-label="Select your focus"
        >
          {FOCUSES.map((f, idx) => (
            <div key={f} data-focus-slide>
              <FocusSlide focus={f} isActive={f === currentFocus} onKeyDown={(e) => handleFocusKeyDown(e, idx)} />
            </div>
          ))}
        </div>
        <ModeDots
          count={FOCUSES.length}
          active={observedFocusIdx}
          onChange={(i) => scrollTo(focusScroller, i)}
        />
      </div>
    </div>
  );
}
