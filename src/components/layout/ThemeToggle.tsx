import { useStore } from "@nanostores/react";
import { theme, toggleTheme } from "../../stores/theme";

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
