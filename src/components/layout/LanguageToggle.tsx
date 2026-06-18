import { useState, useEffect } from "react";
import { lang, toggleLang } from "../../stores/lang";

function useStore<T>(store: { get: () => T; subscribe: (cb: (val: T) => void) => () => void }): T {
  const [value, setValue] = useState(store.get());
  useEffect(() => {
    return store.subscribe((v) => setValue(v));
  }, [store]);
  return value;
}

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