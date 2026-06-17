import { useState, useCallback, useRef, useEffect } from "react";
import { addXP, XP_PER_EXERCISE } from "../../stores/progress";
import { updateChallengeProgress } from "../../stores/challenges";
import { ErrorBoundary } from "./ErrorBoundary";

interface SpeakingItem {
  text: string;
  phonetic?: string;
  hint?: string;
}

interface Props {
  title?: string;
  items: SpeakingItem[];
  level?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function SpeakingPracticeInner({ title, items, level }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const currentItem = items[currentIdx];

  useEffect(() => {
    const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    setSupported(hasSpeechRecognition);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!supported) return;
    setListening(true);
    setResult(null);
    setTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript.toLowerCase().trim();
      setTranscript(text);

      if (current.isFinal) {
        const expected = currentItem.text.toLowerCase().trim();
        const similarity = wordSimilarity(text, expected);
        const isCorrect = similarity >= 0.6;
        setResult(isCorrect ? "correct" : "incorrect");
        setListening(false);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setResult("incorrect");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [currentItem, supported]);

  const speakPhrase = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleNext = () => {
    if (currentIdx < items.length - 1) {
      setCurrentIdx((i) => i + 1);
      setResult(null);
      setTranscript("");
    } else {
      setShowResults(true);
      if (level) {
        addXP(XP_PER_EXERCISE, "speaking");
      }
      updateChallengeProgress("daily_speaking", 1);
      updateChallengeProgress("weekly_all_exercises", 1);
    }
  };

  const handleCheckResult = () => {
    setResults((prev) => ({ ...prev, [currentIdx]: result === "correct" }));
    handleNext();
  };

  if (!supported) {
    return (
      <div className="rounded-xl shadow-border bg-surface p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <h3 className="font-semibold">Speech Recognition Not Available</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Try using Google Chrome or Microsoft Edge to access the speaking practice feature.
        </p>
      </div>
    );
  }

  if (showResults) {
    const correctCount = Object.values(results).filter(Boolean).length;
    return (
      <div className="animate-fade-in-scale rounded-xl shadow-border bg-surface p-8 text-center">
        <h3 className="text-xl font-bold font-display">Speaking Practice Complete!</h3>
        <p className="mt-2 text-text-secondary">
          {correctCount}/{items.length} phrases pronounced correctly
        </p>
        <button
          onClick={() => { setCurrentIdx(0); setResults({}); setShowResults(false); setResult(null); setTranscript(""); }}
          className="mt-4 min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-border bg-surface p-6">
      {title && <h3 className="mb-4 text-lg font-semibold font-display">{title}</h3>}

      <div className="mb-4 flex items-center justify-between text-sm text-text-muted">
        <span>{currentIdx + 1} / {items.length}</span>
        <div className="h-1.5 flex-1 mx-4 rounded-full bg-surface-alt overflow-hidden">
          <div className="h-full rounded-full bg-text transition-all" style={{ width: `${(currentIdx / items.length) * 100}%` }} />
        </div>
      </div>

      {/* Target phrase */}
      <div className="rounded-xl bg-a1-bg p-6 text-center">
        <p className="text-2xl font-bold font-display text-a1">{currentItem.text}</p>
        {currentItem.phonetic && (
          <p className="mt-1 text-sm text-a1/70">{currentItem.phonetic}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => speakPhrase(currentItem.text)}
          className="flex items-center gap-2 min-h-11 rounded-lg bg-surface-alt px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-border transition-colors"
          aria-label="Listen to the phrase"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M16 7.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Listen
        </button>

        <button
          onClick={startListening}
          disabled={listening}
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: listening ? "var(--warning)" : "var(--a1)" }}
        >
          {listening ? (
            <>
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-white" />
              Listening...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              Say It
            </>
          )}
        </button>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-4 rounded-lg p-4 text-center" style={{
          background: result === "correct" ? "var(--correct-bg)" : result === "incorrect" ? "var(--incorrect-bg)" : "var(--surface-alt)",
        }}>
          <p className="text-sm" style={{ color: result === "correct" ? "var(--correct)" : result === "incorrect" ? "var(--incorrect)" : "var(--text-secondary)" }}>
            You said: "{transcript}"
          </p>
        </div>
      )}

      {currentItem.hint && !result && (
        <p className="mt-3 text-center text-xs text-text-muted">{currentItem.hint}</p>
      )}

      {result && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCheckResult}
            className="min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
          >
            {currentIdx < items.length - 1 ? "Next Phrase" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SpeakingPractice(props: Props) {
  return (
    <ErrorBoundary fallbackTitle="Speaking Practice Error">
      <SpeakingPracticeInner {...props} />
    </ErrorBoundary>
  );
}

function wordSimilarity(a: string, b: string): number {
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  let matches = 0;
  const used = new Set<number>();

  for (const wa of wordsA) {
    for (let i = 0; i < wordsB.length; i++) {
      if (used.has(i)) continue;
      const wb = wordsB[i];
      if (wa === wb || levenshtein(wa, wb) <= Math.max(wa.length, wb.length) * 0.4) {
        matches++;
        used.add(i);
        break;
      }
    }
  }

  return matches / Math.max(wordsA.length, wordsB.length);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}