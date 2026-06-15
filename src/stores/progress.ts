import { atom, map } from "nanostores";

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

export function loadFromStorage() {
  if (typeof localStorage === "undefined") return;
  try {
    const saved = localStorage.getItem("course-progress");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.completed) completedLevels.set(data.completed);
      if (data.results) quizResults.set(data.results);
      if (data.streak) streak.set(data.streak);
      if (data.lastDate) lastStudyDate.set(data.lastDate);
    }
    const level = localStorage.getItem("course-level");
    if (level) currentLevel.set(level);
  } catch {}
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

export function markLevelComplete(level: string) {
  const current = completedLevels.get();
  completedLevels.set({ ...current, [level]: true });
  saveToStorage();
}

export function saveQuizResult(level: string, result: QuizResult) {
  const current = quizResults.get();
  quizResults.set({ ...current, [level]: result });
  if (result.passed) markLevelComplete(level);
  saveToStorage();
}

export function getProgressPercent(): number {
  const completed = Object.values(completedLevels.get()).filter(Boolean).length;
  return Math.round((completed / 6) * 100);
}

export function updateStreak() {
  const today = new Date().toISOString().split("T")[0];
  const last = lastStudyDate.get();
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (last === yesterday) {
    streak.set(streak.get() + 1);
  } else {
    streak.set(1);
  }
  lastStudyDate.set(today);
  saveToStorage();
}
