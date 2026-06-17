import { useState, useEffect } from "react";
import type { UnitData } from "../../data/units/types";
import ClickableText from "./ClickableText";
import ExerciseRenderer from "./ExerciseRenderer";
import { vocabularyList } from "../../stores/vocabulary";
import SelectionReader from "./SelectionReader";

// ── Props ─────────────────────────────────────
interface Props {
  unit: UnitData;
}

// ── Sections that can be expanded/collapsed ───
type SectionId = "theory" | string; // exercise ids are also section ids

// ── Component ─────────────────────────────────
export default function LearningUnit({ unit }: Props) {
  const [activeSection, setActiveSection] = useState<string>("theory");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Track saved words count
  useEffect(() => {
    const unsub = vocabularyList.subscribe((list) => {
      setSavedCount(Object.keys(list).length);
    });
    return unsub;
  }, []);

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedSections((prev) => new Set(prev).add(exerciseId));
  };

  const isExerciseCompleted = (id: string) => completedSections.has(id);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setTimeout(() => {
      document.getElementById(`section-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <div className="unit-page">
      {/* ── Header ── */}
      <header className="unit-header">
        <span className="unit-level">{unit.level}</span>
        <h1 className="unit-title">
          <ClickableText text={unit.title} vocabulary={unit.vocabulary} level={unit.level} />
        </h1>
        <div className="unit-description">
          <ClickableText
            text={unit.description}
            vocabulary={unit.vocabulary}
            level={unit.level}
          />
        </div>
      </header>

      {/* ── Navigation tabs ── */}
      {(() => {
        const tabs = [
          { id: "theory", label: "Theory", step: 1 },
          ...unit.exercises.map((ex, idx) => ({
            id: ex.id,
            label: ex.title.split(":")[0],
            step: idx + 2,
          })),
          { id: "evaluation", label: "Evaluation", step: unit.exercises.length + 2 },
        ];
        const completedCount = tabs.filter((t) => isExerciseCompleted(t.id)).length;
        const progressPct = Math.round((completedCount / (tabs.length - 1)) * 100); // -1 because theory isn't "completeable"

        return (
          <nav className="unit-nav-bar">
            {/* Progress line */}
            <div className="unit-nav-progress">
              <div className="unit-nav-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="unit-nav-scroll">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={[
                    "unit-nav-item",
                    activeSection === tab.id ? "active" : "",
                    isExerciseCompleted(tab.id) ? "completed" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <span className="unit-nav-step">
                    {isExerciseCompleted(tab.id) ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                      </svg>
                    ) : (
                      tab.step
                    )}
                  </span>
                  <span className="unit-nav-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        );
      })()}

      {/* ── Theory sections ── */}
      <section id="section-theory" className="space-y-8">
        {unit.sections.map((section) => (
          <div key={section.id} className="theory-section glass-card rounded-[var(--radius-xl)] p-6 sm:p-8 animate-fade-in-up">
            <h2 className="theory-section-title text-xl font-bold font-display border-b pb-3 mb-6 flex items-center gap-2">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((p, i) => {
                const trimmed = p.trim();
                if (!trimmed) return null;

                // Tables: starts with [TABLE]
                if (trimmed.startsWith("[TABLE]")) {
                  const lines = trimmed.split("\n").map(l => l.trim()).filter(Boolean);
                  const rows = lines.slice(1).map(line => line.split("|").map(col => col.trim()));
                  if (rows.length === 0) return null;
                  const headers = rows[0];
                  const bodyRows = rows.slice(1);
                  return (
                    <div key={i} className="table-responsive my-5 border border-border-light/50 shadow-sm rounded-xl overflow-hidden">
                      <table className="premium-table">
                        <thead>
                          <tr className="bg-surface-alt/50 border-b border-border-light">
                            {headers.map((h, idx) => (
                              <th key={idx} className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-light">
                                <ClickableText text={h} vocabulary={unit.vocabulary} level={unit.level} />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-border-light/40 last:border-b-0 hover:bg-surface-raised/30 transition-colors">
                              {row.map((col, cIdx) => (
                                <td key={cIdx} className="py-3 px-4 text-sm font-medium text-text">
                                  <ClickableText text={col} vocabulary={unit.vocabulary} level={unit.level} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Bullet points: starts with •
                if (trimmed.startsWith("•")) {
                  const content = trimmed.slice(1).trim();
                  return (
                    <div key={i} className="bullet-point flex items-start gap-2.5 pl-2">
                      <span className="bullet-icon text-a1 text-sm font-bold mt-0.5">✦</span>
                      <span className="bullet-content text-sm sm:text-base leading-relaxed text-text font-medium">
                        <ClickableText text={content} vocabulary={unit.vocabulary} level={unit.level} />
                      </span>
                    </div>
                  );
                }

                // Callouts: starts with ⚠️ (Warning)
                if (trimmed.startsWith("⚠️")) {
                  const content = trimmed.slice(1).trim();
                  return (
                    <div key={i} className="callout-box warning-callout border-l-4 border-incorrect p-4 rounded-[var(--radius-sm)] flex gap-3 text-sm sm:text-base font-medium">
                      <span className="callout-emoji shrink-0">⚠️</span>
                      <div className="callout-content text-text-secondary leading-relaxed">
                        <ClickableText text={content} vocabulary={unit.vocabulary} level={unit.level} />
                      </div>
                    </div>
                  );
                }

                // Callouts: starts with 📌 (Tip/Note) or is labeled as "Tip:"
                if (trimmed.startsWith("📌")) {
                  const content = trimmed.slice(1).trim();
                  return (
                    <div key={i} className="callout-box tip-callout border-l-4 border-a1 p-4 rounded-[var(--radius-sm)] flex gap-3 text-sm sm:text-base font-medium">
                      <span className="callout-emoji shrink-0">📌</span>
                      <div className="callout-content text-text-secondary leading-relaxed">
                        <ClickableText text={content} vocabulary={unit.vocabulary} level={unit.level} />
                      </div>
                    </div>
                  );
                }

                // Side-by-side correct/incorrect comparisons
                if (trimmed.includes("✗") && trimmed.includes("✓")) {
                  const parts = trimmed.split(/✗|✓/);
                  if (parts.length >= 3) {
                    const incorrectStr = parts[1].trim();
                    const correctStr = parts[2].trim();
                    return (
                      <div key={i} className="comparison-box grid gap-3 sm:grid-cols-2 my-4">
                        <div className="comparison-item incorrect flex items-center gap-2.5 p-3 rounded-lg border-2 border-incorrect bg-incorrect-bg">
                          <span className="comparison-icon shrink-0 text-incorrect font-black">✗</span>
                          <span className="comparison-text text-sm sm:text-base font-bold text-incorrect">
                            <ClickableText text={incorrectStr} vocabulary={unit.vocabulary} level={unit.level} />
                          </span>
                        </div>
                        <div className="comparison-item correct flex items-center gap-2.5 p-3 rounded-lg border-2 border-correct bg-correct-bg">
                          <span className="comparison-icon shrink-0 text-correct font-black">✓</span>
                          <span className="comparison-text text-sm sm:text-base font-bold text-correct">
                            <ClickableText text={correctStr} vocabulary={unit.vocabulary} level={unit.level} />
                          </span>
                        </div>
                      </div>
                    );
                  }
                }

                // Standard paragraph
                return (
                  <p key={i} className="theory-paragraph text-sm sm:text-base text-text leading-relaxed font-medium">
                    <ClickableText text={p} vocabulary={unit.vocabulary} level={unit.level} />
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Divider ── */}
      <hr className="section-divider" />

      {/* ── Exercises ── */}
      {unit.exercises.map((exercise) => (
        <section
          key={exercise.id}
          id={`section-${exercise.id}`}
          className="exercise-section"
        >
          <h2 className="exercise-section-title">
            <ClickableText text={exercise.title} vocabulary={unit.vocabulary} level={unit.level} />
          </h2>
          <p className="exercise-instruction">
            <ClickableText text={exercise.instruction} vocabulary={unit.vocabulary} level={unit.level} />
          </p>
          <ExerciseRenderer
            items={exercise.items}
            vocabulary={unit.vocabulary}
            level={unit.level}
            onEvaluationComplete={() => handleExerciseComplete(exercise.id)}
          />
        </section>
      ))}

      {/* ── Evaluation ── */}
      <section id="section-evaluation" className="exercise-section">
        <hr className="section-divider" />
        <h2 className="exercise-section-title">
          <ClickableText text={unit.evaluation.title} vocabulary={unit.vocabulary} level={unit.level} />
        </h2>
        <p className="exercise-instruction">
          <ClickableText text={unit.evaluation.instruction} vocabulary={unit.vocabulary} level={unit.level} />
        </p>
        <ExerciseRenderer
          items={unit.evaluation.items}
          vocabulary={unit.vocabulary}
          level={unit.level}
          isEvaluation
          onEvaluationComplete={(score, total) => {
            handleExerciseComplete("evaluation");
          }}
        />
      </section>

      {/* ── Saved words FAB ── */}
      <button
        type="button"
        className="saved-words-toggle"
        onClick={() => setShowSaved(!showSaved)}
        title="Saved vocabulary"
      >
        📖
        {savedCount > 0 && (
          <span className="saved-words-badge">{savedCount}</span>
        )}
      </button>

      {/* ── Saved words sidebar ── */}
      <aside className={`saved-words-sidebar ${showSaved ? "open" : ""}`}>
        <h3 className="saved-words-title">Saved Words</h3>
        <SavedWordList />
      </aside>
      <SelectionReader />
    </div>
  );
}

// ── Saved word list (reads from store) ─────────
function SavedWordList() {
  const [words, setWords] = useState<
    { word: string; translation: string }[]
  >([]);

  useEffect(() => {
    const unsub = vocabularyList.subscribe((list) => {
      const arr = Object.values(list)
        .filter(Boolean)
        .map((w: any) => ({
          word: w.word,
          translation: (w as any).definition?.slice(0, 40) || "",
        }))
        .slice(-50) // show last 50 saved
        .reverse();
      setWords(arr);
    });
    return unsub;
  }, []);

  if (words.length === 0) {
    return (
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        Click on any highlighted word in the theory to save it.
      </p>
    );
  }

  return (
    <div>
      {words.map((w, i) => (
        <div key={i} className="saved-word-item">
          <span className="saved-word-word">{w.word}</span>
          <span className="saved-word-translation">
            {w.translation.slice(0, 25)}
          </span>
        </div>
      ))}
    </div>
  );
}
