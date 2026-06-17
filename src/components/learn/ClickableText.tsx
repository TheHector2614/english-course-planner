import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { saveWord } from "../../stores/vocabulary";
import type { VocabEntry } from "../../data/units/types";
import { db } from "../../stores/db";

interface Props { text: string; vocabulary: VocabEntry[]; level?: string }
interface TooltipState {
  word: string;
  entry: VocabEntry | null;
  x: number;
  y: number;
  isLowerHalf?: boolean;
  loading?: boolean;
  audioUrl?: string | null;
}

function parseText(text: string): Array<{ type: "text" | "word"; value: string }> {
  // Strip curly braces that were used for formatting in unit theories
  const clean = text.replace(/[{}]/g, "");
  // Matches letters, numbers, apostrophes, and hyphens as words
  const regex = /([a-zA-Z0-9'-]+)/g;
  const parts = clean.split(regex);
  const r: Array<{ type: "text" | "word"; value: string }> = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (i % 2 === 1) {
      r.push({ type: "word", value: p });
    } else {
      r.push({ type: "text", value: p });
    }
  }
  return r;
}

async function fetchTranslationAndDefinition(term: string): Promise<any> {
  const cleaned = term.toLowerCase().replace(/[^a-z0-9'-]/g, "").trim();
  if (!cleaned) return null;

  try {
    // 1. Check Dexie Cache first
    const cached = await db.dictionaryCache.get(cleaned);
    if (cached) {
      return cached.definitionData;
    }

    // 2. Fetch definition from Dictionary API and translation from Google Translate (gtx) in parallel
    const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleaned)}`;
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(cleaned)}`;
    const gtxUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    const [dictRes, transRes] = await Promise.all([
      fetch(dictUrl).catch(() => null),
      fetch(gtxUrl).catch(() => null)
    ]);

    let dictData = null;
    if (dictRes && dictRes.ok) {
      const json = await dictRes.json();
      if (json && json.length > 0) dictData = json[0];
    }

    let translation = "";
    if (transRes && transRes.ok) {
      const json = await transRes.json();
      translation = json?.[0]?.[0]?.[0] || "";
    }

    // Fallback to MyMemory if Google Translate fails
    if (!translation) {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleaned)}&langpair=en|es`;
      const myMemoryRes = await fetch(myMemoryUrl).catch(() => null);
      if (myMemoryRes && myMemoryRes.ok) {
        const json = await myMemoryRes.json();
        translation = json.responseData?.translatedText || "";
      }
    }

    // Avoid displaying spammy placeholders or self-translations
    if (translation) {
      translation = translation.trim();
      if (
        translation.includes("Online Dictionary Lookup") || 
        translation.includes("dictionary lookup") ||
        translation.toLowerCase() === cleaned
      ) {
        translation = "";
      }
    }

    const combinedResult = {
      dictData,
      translation: translation || "(No translation found)"
    };

    // Cache the result
    await db.dictionaryCache.put({
      word: cleaned,
      definitionData: combinedResult,
      timestamp: Date.now(),
    });

    return combinedResult;
  } catch (err) {
    console.error("Combined fetch error in ClickableText:", err);
  }
  return null;
}

export default function ClickableText({ text, vocabulary, level = "A1" }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [lookedUp, setLookedUp] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);

  const vocabMap = useRef<Record<string, VocabEntry>>({});
  useEffect(() => {
    const m: Record<string, VocabEntry> = {};
    for (const v of vocabulary) m[v.word.toLowerCase()] = v;
    vocabMap.current = m;
  }, [vocabulary]);

  // Pre-load voices on component mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const close = useCallback(() => setTooltip(null), []);
  useEffect(() => {
    if (!tooltip) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [tooltip, close]);

  const parsed = parseText(text);

  const onWordClick = async (e: React.MouseEvent, w: string) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const r = target.getBoundingClientRect();
    const wordKey = w.toLowerCase().replace(/[^a-z0-9'-]/g, "").trim();

    // Prevent clicking punctuation-only remnants
    if (!wordKey) return;

    // Mark word as looked up
    setLookedUp((prev) => new Set(prev).add(wordKey));

    // Show immediate loading tooltip
    setLoadingWord(w);
    const isLowerHalf = r.top > window.innerHeight / 2;
    setTooltip({
      word: w,
      entry: null,
      x: r.left + r.width / 2,
      y: isLowerHalf ? (window.innerHeight - r.top) + 6 : r.bottom + 6,
      isLowerHalf,
      loading: true,
      audioUrl: null,
    });

    // Case 1: Word exists in local unit vocabulary (pre-translated)
    if (vocabMap.current[wordKey]) {
      setTooltip((prev) =>
        prev
          ? {
              ...prev,
              entry: vocabMap.current[wordKey],
              loading: false,
            }
          : null
      );
      setLoadingWord(null);
      return;
    }

    // Case 2: Query database cache or APIs
    const combinedData = await fetchTranslationAndDefinition(w);
    if (combinedData) {
      const dictData = combinedData.dictData;
      const translation = combinedData.translation;

      const meaning = dictData?.meanings?.[0];
      const def = meaning?.definitions?.[0];
      const partOfSpeech = meaning?.partOfSpeech;
      const audioUrl = dictData?.phonetics?.find((p: any) => p.audio)?.audio;

      const mappedEntry: VocabEntry = {
        word: dictData?.word || w,
        translation: translation,
        definition: def?.definition || "No definition found.",
        example: def?.example || "",
        partOfSpeech: partOfSpeech || "noun",
      };

      setTooltip((prev) =>
        prev
          ? {
              ...prev,
              entry: mappedEntry,
              loading: false,
              audioUrl: audioUrl || null,
            }
          : null
      );
    } else {
      // No definition found
      setTooltip((prev) =>
        prev
          ? {
              ...prev,
              loading: false,
              entry: {
                word: w,
                translation: "(No translation available)",
                definition: "Could not find definition online. You can still save this word to study later.",
                example: "",
                partOfSpeech: "",
              },
            }
          : null
      );
    }
    setLoadingWord(null);
  };

  const speakWord = (w: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(w);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Slightly slower for better clarity
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = 
      voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("natural")) ||
      voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("google")) ||
      voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("natural")) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.startsWith("en"));
      
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const onSave = async (w: string, entry: VocabEntry | null) => {
    if (saving) return;
    setSaving(w);
    try {
      await saveWord({
        word: w.toLowerCase(),
        definition: entry?.definition || w,
        example: entry?.example || "",
        partOfSpeech: entry?.partOfSpeech || "noun",
        level,
        tags: ["interactive-lookup"],
      });
      setSaved((prev) => new Set(prev).add(w.toLowerCase()));
    } catch (e) {
      console.error("Save word error in ClickableText:", e);
    } finally {
      setSaving(null);
    }
  };

  // Compute layout values for the tooltip
  const tooltipLeft = tooltip ? Math.max(10, Math.min(tooltip.x - 110, window.innerWidth - 230)) : 0;
  const arrowLeft = tooltip ? tooltip.x - tooltipLeft : 0;

  return (
    <div style={{ display: "contents" }}>
      <span className="clickable-text">
        {parsed.map((p, i) =>
          p.type === "word" ? (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={(e) => onWordClick(e, p.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onWordClick(e as any, p.value);
                }
              }}
              className={[
                "clickable-word",
                saved.has(p.value.toLowerCase()) ? "saved" : "",
                lookedUp.has(p.value.toLowerCase()) && !saved.has(p.value.toLowerCase()) ? "looked-up" : "",
                loadingWord === p.value ? "loading" : "",
              ].filter(Boolean).join(" ")}
            >
              {p.value}
            </span>
          ) : (
            <span key={i}>{p.value}</span>
          )
        )}
      </span>

      {tooltip && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={close}>
          <div
            className={`word-tooltip shadow-border animate-fade-in-scale ${
              tooltip.isLowerHalf ? "tooltip-above" : "tooltip-below"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: tooltipLeft,
              [tooltip.isLowerHalf ? "bottom" : "top"]: tooltip.y,
            }}
          >
            {/* Balloon arrow pointing directly to the clicked word */}
            <div
              className={`tooltip-arrow ${tooltip.isLowerHalf ? "above" : "below"}`}
              style={{ left: arrowLeft }}
            />

            {tooltip.loading ? (
              <div className="tooltip-loading flex items-center justify-center py-4">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-a1 border-t-transparent" />
                <span className="ml-2 text-xs font-semibold text-text-muted">Searching...</span>
              </div>
            ) : (
              <>
                <div className="tooltip-header">
                  <strong>{tooltip.word}</strong>
                  {tooltip.entry?.partOfSpeech && (
                    <span className="tooltip-pos">{tooltip.entry.partOfSpeech}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => speakWord(tooltip.word)}
                    className="ml-auto flex items-center justify-center rounded-full p-1 text-text-muted hover:text-a1 active-scale transition-colors"
                    title="Play pronunciation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3z" />
                      <path
                        d="M16 7.5a6.5 6.5 0 0 1 0 9"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {tooltip.entry && (
                  <div className="tooltip-body-scroll mt-1">
                    {tooltip.entry.translation && (
                      <span className="tooltip-translation">{tooltip.entry.translation}</span>
                    )}
                    <p className="tooltip-definition">{tooltip.entry.definition}</p>
                    {tooltip.entry.example && (
                      <p className="tooltip-example">
                        <em>Example:</em> "{tooltip.entry.example}"
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onSave(tooltip.word, tooltip.entry)}
                  disabled={saving === tooltip.word || saved.has(tooltip.word.toLowerCase())}
                  className={`tooltip-save-btn active-scale ${
                    saved.has(tooltip.word.toLowerCase()) ? "saved" : ""
                  }`}
                >
                  {saving === tooltip.word
                    ? "Saving..."
                    : saved.has(tooltip.word.toLowerCase())
                    ? "✓ Saved"
                    : "Save to vocabulary"}
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

