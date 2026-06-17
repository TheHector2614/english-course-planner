import type { SavedWord } from "../stores/db";

interface ExportWord {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  level: string;
  tags: string[];
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastReview?: number;
  savedAt: number;
  notes?: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportJSON(words: ExportWord[]) {
  const data = {
    exportDate: new Date().toISOString().split("T")[0],
    total: words.length,
    words: words.map((w) => ({
      word: w.word,
      phonetic: w.phonetic || "",
      partOfSpeech: w.partOfSpeech || "",
      definition: w.definition,
      example: w.example || "",
      imageUrl: w.imageUrl || "",
      audioUrl: w.audioUrl || "",
      level: w.level,
      tags: w.tags,
      easeFactor: w.easeFactor,
      interval: w.interval,
      repetitions: w.repetitions,
      lastReview: w.lastReview ? new Date(w.lastReview).toISOString() : "",
      savedAt: new Date(w.savedAt).toISOString(),
      notes: w.notes || "",
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, `vocabulary-export-${data.exportDate}.json`);
}

export function exportCSV(words: ExportWord[]) {
  const headers = [
    "word", "phonetic", "partOfSpeech", "definition", "example",
    "level", "tags", "easeFactor", "interval", "repetitions", "savedAt", "notes",
  ];

  const esc = (s: string) => {
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = words.map((w) =>
    [
      esc(w.word), esc(w.phonetic || ""), esc(w.partOfSpeech || ""),
      esc(w.definition), esc(w.example || ""), esc(w.level),
      esc(w.tags.join("; ")), String(w.easeFactor), String(w.interval),
      String(w.repetitions), new Date(w.savedAt).toISOString().split("T")[0],
      esc(w.notes || ""),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `vocabulary-export-${new Date().toISOString().split("T")[0]}.csv`);
}

export function exportHTMLFlashcards(words: ExportWord[]) {
  const cards = words
    .map(
      (w) => `
    <div class="card">
      <div class="card-front">
        <div class="card-word">${h(w.word)}</div>
        ${w.phonetic ? `<div class="card-phonetic">${h(w.phonetic)}</div>` : ""}
        <div class="card-level">${w.level.toUpperCase()}</div>
      </div>
      <div class="card-back">
        <div class="card-definition">${h(w.definition)}</div>
        ${w.example ? `<div class="card-example">${h(w.example)}</div>` : ""}
        <div class="card-tags">${w.tags.map((t) => `<span class="card-tag">${h(t)}</span>`).join("")}</div>
      </div>
    </div>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Vocabulary Flashcards</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:system-ui,sans-serif; padding:20px; background:#f5f5f5; }
  @media print { body { padding:0; background:white; } .no-print { display:none; } }
  .no-print { text-align:center; margin-bottom:16px; }
  .no-print button { padding:8px 24px; font-size:14px; border:none; background:#333; color:white; border-radius:8px; cursor:pointer; }
  .header { text-align:center; margin-bottom:16px; }
  .header h1 { font-size:24px; }
  .header p { color:#666; font-size:14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .card { border:1px solid #ddd; border-radius:12px; background:white; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }
  .card-front { padding:20px; text-align:center; background:#fafafa; border-bottom:1px solid #eee; }
  .card-word { font-size:20px; font-weight:700; }
  .card-phonetic { font-size:13px; color:#888; margin-top:4px; }
  .card-level { display:inline-block; padding:2px 8px; font-size:11px; font-weight:600; background:#e8f4e8; color:#2d7a2d; border-radius:10px; margin-top:4px; }
  .card-back { padding:16px; }
  .card-definition { font-size:14px; line-height:1.5; color:#333; }
  .card-example { font-size:13px; font-style:italic; color:#666; margin-top:8px; }
  .card-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
  .card-tag { padding:2px 8px; font-size:11px; background:#f0f0f0; border-radius:6px; color:#555; }
</style></head>
<body>
<div class="no-print"><button onclick="window.print()">Print Flashcards</button></div>
<div class="header"><h1>Vocabulary Flashcards</h1><p>${words.length} words</p></div>
<div class="grid">${cards}</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, `vocabulary-flashcards-${new Date().toISOString().split("T")[0]}.html`);
}

export function printVocabulary(words: ExportWord[]) {
  const cards = words
    .map((w) => `
    <div class="card">
      <div class="card-word">${h(w.word)}</div>
      ${w.phonetic ? `<span class="card-phonetic">${h(w.phonetic)}</span>` : ""}
      <span class="card-level">${w.level.toUpperCase()}</span>
      <div class="card-def">${h(w.definition)}</div>
      ${w.example ? `<div class="card-example">${h(w.example)}</div>` : ""}
      <div class="card-tags">${w.tags.map(t => `<span>${h(t)}</span>`).join("")}</div>
    </div>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Vocabulary</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:system-ui,sans-serif; padding:24px; color:#111; }
  @media print { body { padding:0; } .no-print { display:none; } }
  .no-print { text-align:center; margin-bottom:16px; }
  .no-print button { padding:10px 28px; font-size:14px; border:none; background:#222; color:#fff; border-radius:8px; cursor:pointer; }
  .header { text-align:center; margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid #333; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:10px; }
  .card { border:1px solid #ddd; border-radius:8px; padding:12px; break-inside:avoid; page-break-inside:avoid; }
  .card-word { font-size:18px; font-weight:700; }
  .card-phonetic { font-size:13px; color:#888; margin-left:6px; }
  .card-level { font-size:11px; font-weight:600; padding:2px 8px; background:#e8f4e8; border-radius:8px; color:#2d7a2d; margin-left:6px; }
  .card-def { font-size:14px; margin-top:6px; color:#333; }
  .card-example { font-size:13px; font-style:italic; color:#666; margin-top:4px; }
  .card-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
  .card-tags span { font-size:11px; padding:2px 8px; background:#f0f0f0; border-radius:6px; color:#555; }
</style></head>
<body>
<div class="no-print"><button onclick="window.print()">Print / Save as PDF</button></div>
<div class="header"><h1>Vocabulary</h1><p>${words.length} words &middot; ${new Date().toISOString().split("T")[0]}</p></div>
<div class="grid">${cards}</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  } else {
    // Fallback if popup is blocked
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `vocabulary-print-${new Date().toISOString().split("T")[0]}.html`);
  }
}

function h(s: string): string {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
