import { useStore } from "@nanostores/react";
import { lang, toggleLang } from "../../stores/lang";

export default function LanguageToggle() {
  const currentLang = useStore(lang);
  return (
    <button
      onClick={toggleLang}
      className="min-h-11 rounded-full border border-border bg-surface px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-surface-alt active-scale"
      aria-label={`Switch language to ${currentLang === "en" ? "Spanish" : "English"}`}
    >
      {currentLang === "en" ? "ES" : "EN"}
    </button>
  );
}