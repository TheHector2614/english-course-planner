import { atom, map } from "nanostores";
import { db, initSettings } from "./db";
import { unlockAchievement } from "./achievements";

export type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  answers: number[];
  timestamp: number;
};

export const currentLevel = atom<string>("a1");
export const completedLevels = map<Record<string, boolean>>({});
export const quizResults = map<Record<string, QuizResult>>({});
export const streak = atom<number>(0);
export const lastStudyDate = atom<string>("");
export const xp = atom<number>(0);
export const xpAnimating = atom<number>(0); // XP gained this session to animate
export const settingsLoading = atom<boolean>(true);

const XP_PER_QUIZ = 50;
const XP_PER_WORD = 10;
const XP_PER_STORY = 30;
const XP_PER_EXERCISE = 15;
const XP_PER_STREAK_DAY = 20;
const XP_BONUS_PERFECT = 25;

export async function loadFromStorage() {
  settingsLoading.set(true);
  try {
    await initSettings();
  } catch (e) {
    console.error("Failed to initialize settings:", e);
  }
  try {
    const saved = localStorage.getItem("course-progress");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.completed) completedLevels.set(data.completed);
      if (data.results) quizResults.set(data.results);
    }
    const level = localStorage.getItem("course-level");
    if (level) currentLevel.set(level);
  } catch {}

  // IndexedDB is the source of truth for XP, streak, and lastStudyDate
  try {
    const settings = await db.settings.get("default");
    if (settings) {
      xp.set(settings.xp);
      streak.set(settings.streak);
      lastStudyDate.set(settings.lastStudyDate);
    }
  } catch {} finally {
    settingsLoading.set(false);
  }
}

export function saveToStorage() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem("course-progress", JSON.stringify({
      completed: completedLevels.get(),
      results: quizResults.get(),
      streak: streak.get(),
      lastDate: lastStudyDate.get(),
    }));
  } catch {}
}

export async function addXP(amount: number, source: string) {
  const current = xp.get();
  const total = current + amount;
  xp.set(total);
  xpAnimating.set(amount);

  // Persist to IndexedDB
  try {
    await db.settings.update("default", { xp: total });
  } catch {}

  // Animate XP, then clear animation value
  setTimeout(() => xpAnimating.set(0), 1500);

  // Check achievement thresholds
  if (total >= 500) await unlockAchievement("xp_500");
  if (total >= 2000) await unlockAchievement("xp_2000");
  if (total >= 5000) await unlockAchievement("xp_5000");
}

export async function markLevelComplete(level: string) {
  const current = completedLevels.get();
  completedLevels.set({ ...current, [level]: true });
  saveToStorage();
  await addXP(100, "level_complete");

  // Check if all levels are complete
  const allDone = ["a1", "a2", "b1", "b1+", "b2", "b2+"].every(l => completedLevels.get()[l]);
  if (allDone) {
    await unlockAchievement("all_levels");
  }
}

export async function saveQuizResult(level: string, result: QuizResult) {
  const current = quizResults.get();
  quizResults.set({ ...current, [level]: result });
  if (result.passed) await markLevelComplete(level);
  saveToStorage();

  // XP for quiz
  await addXP(XP_PER_QUIZ, "quiz");
  if (result.score === result.total) {
    await addXP(XP_BONUS_PERFECT, "perfect_quiz");
    await unlockAchievement("perfect_quiz");
  }

  await unlockAchievement("first_quiz");
}

export function getProgressPercent(): number {
  const completed = Object.values(completedLevels.get()).filter(Boolean).length;
  return Math.round((completed / 6) * 100);
}

export async function updateStreak() {
  const today = new Date().toISOString().split("T")[0];
  const last = lastStudyDate.get();
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let newStreak: number;
  if (last === yesterday) {
    newStreak = streak.get() + 1;
  } else {
    newStreak = 1;
  }
  streak.set(newStreak);
  lastStudyDate.set(today);
  saveToStorage();

  // Persist to IndexedDB
  try {
    await db.settings.update("default", { streak: newStreak, lastStudyDate: today });
  } catch {}
  await addXP(XP_PER_STREAK_DAY, "streak");

  // Streak achievements
  if (newStreak >= 3) await unlockAchievement("streak_3");
  if (newStreak >= 7) await unlockAchievement("streak_7");
  if (newStreak >= 30) await unlockAchievement("streak_30");
}

export function getXpForNextLevel(): number {
  const currentXp = xp.get();
  if (currentXp < 500) return 500;
  if (currentXp < 1500) return 1500;
  if (currentXp < 3000) return 3000;
  if (currentXp < 5000) return 5000;
  if (currentXp < 8000) return 8000;
  return 12000;
}

export function getLevelFromXp(): number {
  const currentXp = xp.get();
  if (currentXp < 500) return 1;
  if (currentXp < 1500) return 2;
  if (currentXp < 3000) return 3;
  if (currentXp < 5000) return 4;
  if (currentXp < 8000) return 5;
  return 6;
}

export { XP_PER_QUIZ, XP_PER_WORD, XP_PER_STORY, XP_PER_EXERCISE, XP_PER_STREAK_DAY, XP_BONUS_PERFECT };
