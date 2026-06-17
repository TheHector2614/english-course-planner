import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ErrorBoundary } from "./ErrorBoundary";
import { theme, toggleTheme } from "../../stores/theme";
import { lang, toggleLang } from "../../stores/lang";
import { db } from "../../stores/db";
import type { UserSettings } from "../../stores/db";

function SettingsClientInner() {
  const currentTheme = useStore(theme);
  const currentLang = useStore(lang);
  const [name, setName] = useState("Student");
  const [nativeLang, setNativeLang] = useState("es");
  const [saved, setSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    db.settings.get("default").then((s) => {
      if (s) {
        setName(s.name);
        setNativeLang(s.nativeLang);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await db.settings.update("default", { name, nativeLang });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  const handleExportData = async () => {
    const data = {
      exportDate: new Date().toISOString(),
      settings: await db.settings.get("default"),
      vocabulary: await db.vocabulary.toArray(),
      progress: await db.levelProgress.toArray(),
      sessions: await db.sessions.toArray(),
      achievements: await db.achievements.toArray(),
      stories: await db.stories.toArray(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-course-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleImportData = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      if (data.vocabulary) await db.vocabulary.bulkPut(data.vocabulary);
      if (data.settings) await db.settings.put(data.settings);
      if (data.progress) await db.levelProgress.bulkPut(data.progress);
      if (data.sessions) await db.sessions.bulkPut(data.sessions);
      if (data.achievements) await db.achievements.bulkPut(data.achievements);
      if (data.stories) await db.stories.bulkPut(data.stories);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Import error:", e);
      alert("Failed to import data. Check the file format.");
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure? This will delete ALL your data. Export a backup first.")) return;
    if (!confirm("Really? All vocabulary, progress, achievements, and stories will be lost.")) return;
    await db.vocabulary.clear();
    await db.levelProgress.clear();
    await db.sessions.clear();
    await db.achievements.clear();
    await db.stories.clear();
    alert("All data cleared. Refresh the page to start fresh.");
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div className="rounded-xl shadow-border bg-surface p-6">
        <h2 className="text-lg font-semibold font-display mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm outline-none focus:border-text"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Native Language</label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              className="rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm outline-none focus:border-text"
            >
              <option value="es">Spanish</option>
              <option value="pt">Portuguese</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
className="mt-4 min-h-11 rounded-full bg-text px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
          >
            {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Appearance */}
      <div className="rounded-xl shadow-border bg-surface p-6">
        <h2 className="text-lg font-semibold font-display mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-text-secondary">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="min-h-11 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-alt"
          >
            {currentTheme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Language</p>
            <p className="text-xs text-text-secondary">Interface language</p>
          </div>
          <button
            onClick={toggleLang}
            className="min-h-11 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-alt"
          >
            {currentLang === "en" ? "Español" : "English"}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl shadow-border bg-surface p-6">
        <h2 className="text-lg font-semibold font-display mb-4">Data Management</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Export All Data</p>
            <p className="text-xs text-text-secondary mb-2">Download a complete backup of your progress, vocabulary, and achievements</p>
            <button
              onClick={handleExportData}
              className="min-h-11 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 active-scale"
            >
              Download Backup (JSON)
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">Import Data</p>
            <p className="text-xs text-text-secondary mb-2">Restore from a previous backup file</p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-sm text-text-secondary file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-border file:bg-surface-alt file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-text-secondary hover:file:bg-border"
              />
              {importFile && (
                <button
                  onClick={handleImportData}
                  className="min-h-11 rounded-full bg-surface-alt px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-border"
                >
                  Import
                </button>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-incorrect">Danger Zone</p>
            <p className="text-xs text-text-secondary mb-2">Clear all data. This cannot be undone.</p>
            <button
              onClick={handleClearData}
              className="min-h-11 rounded-full border border-incorrect px-5 py-2.5 text-sm font-medium text-incorrect transition-colors hover:bg-incorrect/10"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsClient() {
  return (
    <ErrorBoundary fallbackTitle="Settings Error">
      <SettingsClientInner />
    </ErrorBoundary>
  );
}