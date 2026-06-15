import { atom } from "nanostores";

export const theme = atom<"light" | "dark">("light");

export function loadTheme() {
  if (typeof localStorage === "undefined") return;
  const saved = localStorage.getItem("course-theme") as "light" | "dark" | null;
  if (saved) {
    theme.set(saved);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme.set("dark");
  }
  applyTheme(theme.get());
}

export function toggleTheme() {
  const next = theme.get() === "light" ? "dark" : "light";
  theme.set(next);
  localStorage.setItem("course-theme", next);
  applyTheme(next);
}

function applyTheme(t: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", t);
}
