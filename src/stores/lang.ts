import { atom } from "nanostores";

export const lang = atom<"en" | "es">("en");

export function loadLang() {
  if (typeof localStorage === "undefined") return;
  const saved = localStorage.getItem("course-lang") as "en" | "es" | null;
  if (saved) lang.set(saved);
}

export function toggleLang() {
  const next = lang.get() === "en" ? "es" : "en";
  lang.set(next);
  localStorage.setItem("course-lang", next);
}
