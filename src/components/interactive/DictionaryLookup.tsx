import React, { useState, useCallback, useEffect, useRef } from "react";
import { saveWord } from "../../stores/vocabulary";
import { addXP, XP_PER_WORD } from "../../stores/progress";
import { getImageForWord, searchUnsplashImages, hasUnsplashKey } from "../../utils/unsplash";
import { ErrorBoundary } from "./ErrorBoundary";
import { db } from "../../stores/db";

interface DictResult {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms: string[] }[];
  }[];
  sourceUrls?: string[];
}

interface Phonetic {
  text?: string;
  audio?: string;
}

const levelHints: Record<string, string> = {
  a1: "A1 - Beginner words",
  a2: "A2 - Elementary",
  b1: "B1 - Intermediate",
  "b1+": "B1+ - Upper Intermediate",
  b2: "B2 - Advanced",
  "b2+": "B2+ - Pre-Advanced",
};

async function fetchWithBackoff(url: string, retries = 3, delay = 500): Promise<Response> {
  try {
    const res = await fetch(url);
    if (res.status === 404) return res; // Don't retry on 404 (Not Found)
    if (!res.ok && retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithBackoff(url, retries - 1, delay * 2);
    }
    return res;
  } catch (e) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithBackoff(url, retries - 1, delay * 2);
    }
    throw e;
  }
}

function DictionaryLookupInner() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictResult | null>(null);
  const [phonetics, setPhonetics] = useState<Phonetic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saveLevel, setSaveLevel] = useState("a1");
  const [saveTags, setSaveTags] = useState("");
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const [imageResults, setImageResults] = useState<Array<{ url: string; author: string; authorUrl: string }>>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const search = useCallback(async () => {
    const term = query.trim();
    if (!term) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // 1. Check local IndexedDB cache first
      const cached = await db.dictionaryCache.get(term.toLowerCase());
      if (cached) {
        const data = cached.definitionData;
        setResult(data[0]);
        setPhonetics(data[0].phonetics || []);
        return;
      }

      // 2. Fetch with backoff retry
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`;
      const res = await fetchWithBackoff(url);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Word not found. Try a different spelling.");
        throw new Error("Dictionary service unavailable. Try again later.");
      }
      const data: DictResult[] = await res.json();
      if (!data || data.length === 0) throw new Error("Word not found.");

      // 3. Cache the successful result
      await db.dictionaryCache.put({
        word: term.toLowerCase(),
        definitionData: data,
        timestamp: Date.now(),
      });

      setResult(data[0]);
      setPhonetics(data[0].phonetics || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  const searchImages = useCallback(async () => {
    const term = query.trim();
    if (!term) return;
    setImageLoading(true);
    try {
      const results = await searchUnsplashImages(term);
      setImageResults(results);
    } catch (e) {
      console.error("Image search error:", e);
    } finally {
      setImageLoading(false);
    }
  }, [query]);

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    setAudioPlaying(url);
    audio.onended = () => setAudioPlaying(null);
    audio.play().catch(() => setAudioPlaying(null));
  };

  const handleSave = async (word: string, partOfSpeech: string | undefined, definition: string, example?: string) => {
    if (saved[word]) return;
    const tags = saveTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const phonetic = phonetics.find((p) => p.text)?.text || undefined;
    const audioUrl = phonetics.find((p) => p.audio)?.audio || undefined;

    await saveWord({
      word,
      phonetic,
      partOfSpeech,
      definition,
      example,
      audioUrl,
      imageUrl: selectedImage || undefined,
      level: saveLevel,
      tags,
    });

    setSaved((prev) => ({ ...prev, [word]: true }));
    await addXP(XP_PER_WORD, "vocabulary");
  };

  const playExample = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any English word..."
            className="w-full rounded-[var(--radius-lg)] border border-border bg-surface p-4 pr-12 text-base outline-none transition-all focus:border-a2 focus:ring-4 focus:ring-a2-bg/30"
            aria-label="Search word"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResult(null); setError(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-text px-6 py-4 text-sm font-bold text-surface transition-all hover:opacity-95 disabled:opacity-40 active-scale shadow-md min-h-11"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-in rounded-[var(--radius-lg)] border border-incorrect p-4 text-sm text-incorrect" style={{ background: "color-mix(in oklch, var(--incorrect) 10%, transparent)" }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-4 rounded-[var(--radius-lg)] glass-card p-6">
          <div className="h-6 w-1/3 rounded bg-surface-alt" />
          <div className="h-4 w-1/4 rounded bg-surface-alt" />
          <div className="h-4 w-full rounded bg-surface-alt" />
          <div className="h-4 w-5/6 rounded bg-surface-alt" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="animate-fade-in-up space-y-6">
          <div className="glass-card rounded-[var(--radius-lg)] p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text">{result.word}</h2>
                {phonetics.map((p, i) => (
                  <div key={i} className="mt-2.5 flex items-center gap-2 flex-wrap">
                    {p.text && <span className="text-text-muted font-mono font-medium">{p.text}</span>}
                    {p.audio && (
                      <button
                        onClick={() => playAudio(p.audio!)}
                        className="min-h-11 flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all hover:shadow-sm active-scale"
                        style={{
                          background: "var(--surface-alt)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                        aria-label="Listen to pronunciation"
                      >
                        {audioPlaying === p.audio ? (
                          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-a1" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3z" /><path d="M16 7.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                        Listen
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Save controls */}
              <div className="shrink-0 space-y-2.5 min-w-[170px] w-full sm:w-auto">
                <select
                  value={saveLevel}
                  onChange={(e) => setSaveLevel(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface p-2 text-xs font-semibold outline-none transition-all focus:border-a2 focus:ring-2 focus:ring-a2-bg"
                  aria-label="CEFR level"
                >
                  {Object.entries(levelHints).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="tags: grammar, travel"
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface p-2 text-xs outline-none transition-all focus:border-a2 focus:ring-2 focus:ring-a2-bg"
                  aria-label="Tags"
                />
                <button
                  onClick={searchImages}
                  disabled={imageLoading || !query.trim() || !hasUnsplashKey}
                  className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-surface-alt border border-border px-3 py-2 text-xs font-bold text-text-secondary transition-all hover:bg-border disabled:opacity-40 min-h-11 active-scale"
                >
                  {imageLoading ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-text border-t-transparent" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                  Find Image
                </button>
                {!hasUnsplashKey && (
                  <p className="text-[10px] font-semibold text-warning text-center mt-1">
                    Image search unavailable (missing API key)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image Results */}
          {imageResults.length > 0 && (
            <div className="animate-fade-in-up space-y-4">
              <h3 className="text-sm font-bold text-text-secondary">Choose an image to associate with this word</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageResults.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative aspect-square rounded-[var(--radius-md)] overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === img.url
                        ? "border-a1 shadow-md scale-[1.02]"
                        : "border-border hover:border-text-muted"
                    }`}
                    style={selectedImage === img.url ? { boxShadow: "0 8px 20px -4px color-mix(in oklch, var(--a1) 40%, transparent)" } : undefined}
                    aria-label={`Select image ${idx + 1} by ${img.author}`}
                    aria-pressed={selectedImage === img.url}
                  >
                    <img
                      src={img.url}
                      alt={`Image for ${query} by ${img.author}`}
                      className="w-full h-full object-cover img-outline transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    {selectedImage === img.url && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 right-1 text-xs text-white/90 truncate px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      {img.author}
                    </div>
                  </button>
                ))}
              </div>
              {selectedImage && (
                <p className="text-xs text-correct font-semibold text-center">
                  Image selected successfully. It will be saved with the word.
                </p>
              )}
            </div>
          )}

          {/* Meanings */}
          {result.meanings.map((m, mi) => (
            <div key={mi} className="glass-card rounded-[var(--radius-lg)] p-5 transition-all duration-300">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-bold text-a2 bg-a2-bg" style={{ border: "1px solid color-mix(in oklch, var(--a2) 20%, transparent)" }}>
                {m.partOfSpeech}
              </span>
              <div className="mt-4 space-y-4">
                {m.definitions.map((d, di) => (
                  <div key={di} className="animate-fade-in-up border-b border-border-light last:border-b-0 pb-4 last:pb-0" style={{ animationDelay: `${di * 50}ms` }}>
                    <p className="text-base text-text leading-relaxed">{d.definition}</p>
                    {d.example && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-text-secondary italic">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-1 shrink-0">
                          <path d="M10 17l5-5-5-5" />
                        </svg>
                        <span>"{d.example}"</span>
                        <button
                          onClick={() => playExample(d.example!)}
                          className="shrink-0 rounded p-1 text-text-muted transition-colors hover:text-text active-scale"
                          aria-label="Listen to example"
                          title="Listen"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {d.synonyms && d.synonyms.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {d.synonyms.slice(0, 4).map((s) => (
                          <span key={s} className="rounded-full bg-a1-bg px-2.5 py-0.5 text-xs text-a1 font-semibold" style={{ border: "1px solid color-mix(in oklch, var(--a1) 15%, transparent)" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleSave(result.word, m.partOfSpeech, d.definition, d.example)}
                      disabled={saved[result.word]}
                      className="mt-3.5 flex items-center gap-2 min-h-11 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-80 active-scale"
                      style={{
                        background: saved[result.word] ? "var(--correct)" : "var(--surface-alt)",
                        color: saved[result.word] ? "var(--surface)" : "var(--text-secondary)",
                        border: saved[result.word] ? "1px solid var(--correct)" : "1px solid var(--border)",
                      }}
                    >
                      {saved[result.word] ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Saved to Vocabulary
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                          Save to Vocabulary
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DictionaryLookup() {
  return (
    <ErrorBoundary fallbackTitle="Dictionary Lookup Error">
      <DictionaryLookupInner />
    </ErrorBoundary>
  );
}
