import { useState } from "react";
import type { ExerciseItem, VocabEntry } from "../../data/units/types";
import ClickableText from "./ClickableText";

// ── Props ─────────────────────────────────────
interface Props {
  items: ExerciseItem[];
  vocabulary: VocabEntry[];
  level?: string;
  /** If true, shows score after submit */
  isEvaluation?: boolean;
  /** Called when evaluation is submitted with score */
  onEvaluationComplete?: (score: number, total: number) => void;
}

// ── Type helpers ──────────────────────────────
type Answers = Record<number, number | string>;

// ── Component ─────────────────────────────────
export default function ExerciseRenderer({
  items,
  vocabulary,
  level,
  isEvaluation,
  onEvaluationComplete,
}: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (idx: number, value: number | string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === "fill-blank" || item.type === "mcq") {
        if (answers[i] === item.answer) correct++;
      } else if (item.type === "error-spot") {
        // User must select "correct" (index 0) or "incorrect" (index 1)
        if (answers[i] === 0) correct++;
      }
    }
    setScore(correct);
    setSubmitted(true);
    if (isEvaluation && onEvaluationComplete) {
      onEvaluationComplete(correct, items.length);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="exercise-renderer">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`exercise-item ${submitted ? (isCorrect(item, answers[idx]) ? "correct" : "incorrect") : ""}`}
        >
          <div className="exercise-header-row">
            <span className="exercise-number">{idx + 1}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary" style={{ opacity: 0.8 }}>
              {item.type === "fill-blank"
                ? "Fill in the blank"
                : item.type === "mcq"
                ? "Multiple choice"
                : "Spot the error"}
            </span>
            {submitted && (
              <span
                className={`ml-auto text-xs font-bold uppercase tracking-wider ${
                  isCorrect(item, answers[idx]) ? "text-correct" : "text-incorrect"
                }`}
              >
                {isCorrect(item, answers[idx]) ? "✓ Correct" : "✗ Incorrect"}
              </span>
            )}
          </div>

          <div className="exercise-content">
            {item.type === "fill-blank" && (
              <FillBlankItem
                item={item}
                selected={answers[idx] as number | undefined}
                onSelect={(v) => handleSelect(idx, v)}
                submitted={submitted}
                vocabulary={vocabulary}
                level={level}
              />
            )}
            {item.type === "mcq" && (
              <MCQItem
                item={item}
                selected={answers[idx] as number | undefined}
                onSelect={(v) => handleSelect(idx, v)}
                submitted={submitted}
                vocabulary={vocabulary}
                level={level}
              />
            )}
            {item.type === "error-spot" && (
              <ErrorSpotItem
                item={item}
                selected={answers[idx] as number | undefined}
                onSelect={(v) => handleSelect(idx, v)}
                submitted={submitted}
                vocabulary={vocabulary}
                level={level}
              />
            )}
          </div>

          {/* Explanation after submission (only for incorrect answers in evaluation) */}
          {submitted && !isCorrect(item, answers[idx]) && "explanation" in item && item.explanation && (
            <p className="exercise-explanation">
              <ClickableText text={item.explanation} vocabulary={vocabulary} level={level} />
            </p>
          )}
          {submitted && !isCorrect(item, answers[idx]) && item.type === "error-spot" && (
            <p className="exercise-explanation">
              <ClickableText text={item.explanation} vocabulary={vocabulary} level={level} />
            </p>
          )}
        </div>
      ))}

      {/* Submit / Reset buttons */}
      <div className="exercise-actions">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < items.length}
            className="exercise-submit-btn"
          >
            {isEvaluation ? "Submit evaluation" : "Check answers"}
          </button>
        ) : isEvaluation ? (
          <div className="evaluation-result">
            <p className="evaluation-score">
              Score: <strong>{score}</strong> / {items.length}
              {" "}
              <span className={score >= 7 ? "pass" : "fail"}>
                ({score >= 7 ? "✅ PASSED" : "❌ TRY AGAIN"})
              </span>
            </p>
            <button type="button" onClick={handleReset} className="exercise-reset-btn">
              Retry evaluation
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleReset} className="exercise-reset-btn">
            Reset answers
          </button>
        )}
      </div>

      <style>{`
        .exercise-renderer {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .exercise-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border-light);
          transition: border-color 0.2s, background 0.2s;
        }
        .exercise-item.correct {
          border-color: var(--correct);
          background: var(--correct-bg);
        }
        .exercise-item.incorrect {
          border-color: var(--incorrect);
          background: var(--incorrect-bg);
        }
        .exercise-number {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--a1-bg);
          color: var(--a1);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .exercise-content {
          flex: 1;
          min-width: 0;
        }
        .exercise-explanation {
          flex-basis: 100%;
          margin: 6px 0 0 38px;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
          padding: 8px 10px;
          background: var(--surface-alt);
          border-radius: 8px;
        }
        .exercise-actions {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .exercise-submit-btn,
        .exercise-reset-btn {
          padding: 10px 28px;
          border: none;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .exercise-submit-btn {
          background: var(--a1);
          color: white;
        }
        .exercise-submit-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .exercise-submit-btn:hover:not(:disabled) {
          opacity: 0.85;
        }
        .exercise-reset-btn {
          background: var(--surface-alt);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .exercise-reset-btn:hover {
          background: var(--border);
        }
        .evaluation-result {
          text-align: center;
          padding: 16px;
        }
        .evaluation-score {
          font-size: 1.1rem;
          margin: 0 0 10px;
        }
        .evaluation-score .pass {
          color: var(--correct);
          font-weight: 700;
        }
        .evaluation-score .fail {
          color: var(--incorrect);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

// ── Helper: check if item is correct ──────────
function isCorrect(item: ExerciseItem, answer: number | string | undefined): boolean {
  if (answer === undefined) return false;
  if (item.type === "fill-blank" || item.type === "mcq") {
    return answer === item.answer;
  }
  if (item.type === "error-spot") {
    return answer === 0; // 0 means "correct"
  }
  return false;
}

// ── Sub-components ────────────────────────────

function FillBlankItem({
  item,
  selected,
  onSelect,
  submitted,
  vocabulary,
  level,
}: {
  item: Extract<ExerciseItem, { type: "fill-blank" }>;
  selected: number | undefined;
  onSelect: (v: number) => void;
  submitted: boolean;
  vocabulary: VocabEntry[];
  level?: string;
}) {
  // Split prompt at ___
  const parts = item.prompt.split("___");
  return (
    <p className="fill-blank-prompt">
      <ClickableText text={parts[0]} vocabulary={vocabulary} level={level} />
      <span className="fill-blank-select-wrapper">
        <select
          value={selected ?? ""}
          onChange={(e) => onSelect(Number(e.target.value))}
          disabled={submitted}
          className={`fill-blank-select ${submitted ? (selected === item.answer ? "is-correct" : "is-wrong") : ""}`}
        >
          <option value="" disabled>
            ___
          </option>
          {item.options.map((opt, i) => (
            <option key={i} value={i}>
              {opt}
            </option>
          ))}
        </select>
        {submitted && selected !== item.answer && (
          <span className="correct-answer">
            ✓ <ClickableText text={item.options[item.answer]} vocabulary={vocabulary} level={level} />
          </span>
        )}
      </span>
      {parts[1] && <ClickableText text={parts[1]} vocabulary={vocabulary} level={level} />}
    </p>
  );
}

function MCQItem({
  item,
  selected,
  onSelect,
  submitted,
  vocabulary,
  level,
}: {
  item: Extract<ExerciseItem, { type: "mcq" }>;
  selected: number | undefined;
  onSelect: (v: number) => void;
  submitted: boolean;
  vocabulary: VocabEntry[];
  level?: string;
}) {
  return (
    <div className="mcq-container">
      <p className="mcq-question">
        <ClickableText text={item.question} vocabulary={vocabulary} level={level} />
      </p>
      <div className="mcq-options">
        {item.options.map((opt, i) => {
          let className = "mcq-option";
          if (selected === i) className += " selected";
          if (submitted) {
            if (i === item.answer) className += " is-correct";
            else if (selected === i && i !== item.answer) className += " is-wrong";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              disabled={submitted}
              className={className}
            >
              <span className="mcq-letter">{String.fromCharCode(65 + i)}</span>
              <span>
                <ClickableText text={opt} vocabulary={vocabulary} level={level} />
              </span>
              {submitted && i === item.answer && <span className="check-icon">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ErrorSpotItem({
  item,
  selected,
  onSelect,
  submitted,
  vocabulary,
  level,
}: {
  item: Extract<ExerciseItem, { type: "error-spot" }>;
  selected: number | undefined;
  onSelect: (v: number) => void;
  submitted: boolean;
  vocabulary: VocabEntry[];
  level?: string;
}) {
  const options = [
    { label: `✗ "${item.incorrect}" is INCORRECT`, value: 0 },
    { label: `✓ "${item.incorrect}" is CORRECT`, value: 1 },
  ];

  return (
    <div className="error-spot-container">
      <p className="error-spot-sentence">
        <span className="error-label">Sentence:</span> "
        <ClickableText text={item.incorrect} vocabulary={vocabulary} level={level} />"
      </p>
      <p className="error-spot-question">Is this sentence correct or incorrect?</p>
      <div className="error-spot-options">
        {options.map((opt) => {
          let className = "mcq-option";
          if (selected === opt.value) className += " selected";
          if (submitted) {
            if (opt.value === 0) className += " is-correct"; // "incorrect" is always right
            else if (selected === opt.value) className += " is-wrong";
          }
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              disabled={submitted}
              className={className}
            >
              <span className="mcq-letter">{opt.value === 0 ? "A" : "B"}</span>
              <span>
                <ClickableText text={opt.label} vocabulary={vocabulary} level={level} />
              </span>
              {submitted && opt.value === 0 && <span className="check-icon">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
