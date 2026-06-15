import React, { useState, useCallback, useEffect, useRef } from "react";
import { saveWord } from "../../stores/vocabulary";
import { addXP, XP_PER_WORD } from "../../stores/progress";

interface DictResult {
  word: string;
  phonetic?: string;
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
  b2: "B2 - Advanced",
};

export default function DictionaryLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictResult | null>(null);
  const [phonetics, setPhonetics] = useState<Phonetic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saveLevel, setSaveLevel] = useState("a1");
  const [saveTags, setSaveTags] = useState("");
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
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
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Word not found. Try a different spelling.");
        throw new Error("Dictionary service unavailable. Try again later.");
      }
      const data: DictResult[] = await res.json();
      if (!data || data.length === 0) throw new Error("Word not found.");
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

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    setAudioPlaying(url);
    audio.onended = () => setAudioPlaying(null);
    audio.play().catch(() => setAudioPlaying(null));
  };

  const handleSave = async (word: string, definition: string, example?: string) => {
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
      definition,
      example,
      audioUrl,
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
    <div class="space-y-6">
      {/* Search */}
      <div class="flex gap-3">
        <div class="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any English word..."
            class="w-full rounded-xl border border-border bg-surface p-4 pr-12 text-base outline-none transition-colors focus:ring-2"
            aria-label="Search word"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResult(null); setError(""); }}
              class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              aria-label="Clear search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          class="flex items-center gap-2 rounded-xl bg-text px-5 py-4 text-sm font-semibold text-surface transition-all hover:opacity-90 disabled:opacity-40"
        >
          {loading ? (
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div class="animate-fade-in rounded-xl border border-incorrect bg-incorrect/10 p-4 text-sm text-incorrect">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div class="animate-pulse space-y-3 rounded-xl border border-border p-6">
          <div class="h-6 w-1/3 rounded bg-surface-alt" />
          <div class="h-4 w-1/4 rounded bg-surface-alt" />
          <div class="h-4 w-full rounded bg-surface-alt" />
          <div class="h-4 w-5/6 rounded bg-surface-alt" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div class="animate-fade-in-up space-y-6">
          <div class="rounded-xl border border-border bg-surface p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-3xl font-bold font-display tracking-tight">{result.word}</h2>
                {phonetics.map((p, i) => (
                  <div key={i} class="mt-1 flex items-center gap-2">
                    {p.text && <span class="text-text-muted">{p.text}</span>}
                    {p.audio && (
                      <button
                        onClick={() => playAudio(p.audio!)}
                        class="flex items-center gap-1 rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-border"
                        aria-label="Listen to pronunciation"
                      >
                        {audioPlaying === p.audio ? (
                          <span class="inline-block h-3 w-3 animate-pulse rounded-full bg-a1" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3z" /><path d="M16 7.5a6.5 6.5 0 0 1 0 9" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>
                        )}
                        Listen
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Save controls */}
              <div class="shrink-0 space-y-2">
                <select
                  value={saveLevel}
                  onChange={(e) => setSaveLevel(e.target.value)}
                  class="w-full rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium outline-none"
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
                  class="w-full rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs outline-none"
                  aria-label="Tags"
                />
              </div>
            </div>
          </div>

          {/* Meanings */}
          {result.meanings.map((m, mi) => (
            <div key={mi} class="rounded-xl border border-border bg-surface p-5">
              <span class="inline-block rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold text-text-secondary">
                {m.partOfSpeech}
              </span>
              <div class="mt-3 space-y-3">
                {m.definitions.map((d, di) => (
                  <div key={di} class="animate-fade-in-up" style={{ animationDelay: `${di * 50}ms` }}>
                    <p class="text-base">{d.definition}</p>
                    {d.example && (
                      <div class="mt-1 flex items-start gap-2 text-sm text-text-secondary italic">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 shrink-0">
                          <path d="M10 17l5-5-5-5" />
                        </svg>
                        <span>"{d.example}"</span>
                        <button
                          onClick={() => playExample(d.example!)}
                          class="shrink-0 rounded p-1 text-text-muted transition-colors hover:text-text"
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
                      <div class="mt-1 flex flex-wrap gap-1">
                        {d.synonyms.slice(0, 4).map((s) => (
                          <span key={s} class="rounded-full bg-a1-bg px-2 py-0.5 text-xs text-a1">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleSave(result.word, d.definition, d.example)}
                      disabled={saved[result.word]}
                      class="mt-2 flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-all disabled:opacity-50"
                      style={{
                        background: saved[result.word] ? "var(--correct)" : "var(--surface-alt)",
                        color: saved[result.word] ? "white" : "var(--text-secondary)",
                      }}
                    >
                      {saved[result.word] ? (
                        <>Saved</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save to Vocabulary</>
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
