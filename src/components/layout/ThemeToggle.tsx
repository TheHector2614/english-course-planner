import { useState, useEffect } from "react";
import { theme, toggleTheme } from "../../stores/theme";

function useStore<T>(store: { get: () => T; subscribe: (cb: (val: T) => void) => () => void }): T {
  const [value, setValue] = useState(store.get());
  useEffect(() => {
    return store.subscribe((v) => setValue(v));
  }, [store]);
  return value;
}

export default function ThemeToggle() {
  const $theme = useStore(theme);
  return (
    <button
      onClick={toggleTheme}
      className="min-h-11 rounded-full border border-border bg-surface px-4 py-2.5 text-sm transition-colors hover:bg-surface-alt active-scale"
      aria-label={`Switch to ${$theme === "light" ? "dark" : "light"} mode`}
    >
      {$theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
