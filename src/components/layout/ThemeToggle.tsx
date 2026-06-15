import { useStore } from "@nanostores/react";
import { theme, toggleTheme } from "../../stores/theme";

export default function ThemeToggle() {
  const $theme = useStore(theme);
  return (
    <button
      onClick={toggleTheme}
      class="rounded-full border border-border bg-surface px-3 py-1 text-sm transition-colors hover:bg-surface-alt"
      aria-label={`Switch to ${$theme === "light" ? "dark" : "light"} mode`}
    >
      {$theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
