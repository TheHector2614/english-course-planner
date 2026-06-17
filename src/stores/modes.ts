import { atom } from "nanostores";
import { db } from "./db";

import { LEVEL_LABELS, LEVEL_COLORS } from "../data/levels";
import type { CEFRLevel } from "../data/levels";

export type LevelMode = CEFRLevel;
export type FocusMode = "general" | "business" | "technology";

export const FOCUS_LABELS: Record<FocusMode, string> = {
  general: "General English",
  business: "Business English",
  technology: "Technology English",
};

export const FOCUS_DESCS: Record<FocusMode, string> = {
  general: "Complete course — grammar, reading, writing, speaking",
  business: "Emails, meetings, negotiations, presentations",
  technology: "Tech docs, code reviews, standups, conferences",
};

export const levelMode = atom<LevelMode>("a1");
export const focusMode = atom<FocusMode>("general");



export function loadMode() {
  if (typeof localStorage === "undefined") return;
  const savedLevel = localStorage.getItem("course-level-mode") as LevelMode | null;
  if (savedLevel && LEVEL_LABELS[savedLevel]) levelMode.set(savedLevel);
  const savedFocus = localStorage.getItem("course-focus-mode") as FocusMode | null;
  if (savedFocus && FOCUS_LABELS[savedFocus]) focusMode.set(savedFocus);
  applyMode();
}

export function setLevelMode(m: LevelMode) {
  levelMode.set(m);
  if (typeof localStorage !== "undefined") localStorage.setItem("course-level-mode", m);
  applyMode();
}

export function setFocusMode(m: FocusMode) {
  focusMode.set(m);
  if (typeof localStorage !== "undefined") localStorage.setItem("course-focus-mode", m);
  applyMode();
  persistModePref();
}

async function persistModePref() {
  try {
    await db.settings.update("default", { focus: focusMode.get() } as any);
  } catch {}
}

function applyMode() {
  if (typeof document === "undefined") return;
  const level = levelMode.get();
  const focus = focusMode.get();
  document.documentElement.setAttribute("data-level", level);
  document.documentElement.setAttribute("data-focus", focus);
}
