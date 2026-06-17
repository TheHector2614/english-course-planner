import { atom, map } from "nanostores";
import { db, type Challenge } from "./db";
import { addXP } from "./progress";
import { unlockAchievement } from "./achievements";

export interface ChallengeDef {
  id: string;
  type: "daily" | "weekly";
  title: string;
  desc: string;
  goal: number;
  xpReward: number;
  icon: string;
}

const DAILY_CHALLENGES: ChallengeDef[] = [
  { id: "daily_score_quiz", type: "daily", title: "Quiz Master", desc: "Score 80%+ on a quiz", goal: 1, xpReward: 30, icon: "quiz" },
  { id: "daily_complete_exercises", type: "daily", title: "Exercise Streak", desc: "Complete 3 exercises", goal: 3, xpReward: 25, icon: "exercise" },
  { id: "daily_save_words", type: "daily", title: "Word Collector", desc: "Save 5 new words", goal: 5, xpReward: 20, icon: "vocab" },
  { id: "daily_study_minutes", type: "daily", title: "Focused Mind", desc: "Study for 15 minutes", goal: 15, xpReward: 30, icon: "timer" },
  { id: "daily_read_stories", type: "daily", title: "Bookworm", desc: "Read 2 stories", goal: 2, xpReward: 25, icon: "read" },
  { id: "daily_crossword", type: "daily", title: "Word Detective", desc: "Complete a crossword", goal: 1, xpReward: 20, icon: "crossword" },
  { id: "daily_perfect_quiz", type: "daily", title: "Perfect Score", desc: "Get 100% on any quiz", goal: 1, xpReward: 40, icon: "perfect" },
  { id: "daily_speaking", type: "daily", title: "Speak Up", desc: "Complete 2 speaking exercises", goal: 2, xpReward: 25, icon: "speak" },
  { id: "daily_dictation", type: "daily", title: "Listen & Write", desc: "Complete 2 dictations", goal: 2, xpReward: 25, icon: "dictation" },
  { id: "daily_flashcards", type: "daily", title: "Flashcard Fan", desc: "Review 10 flashcards", goal: 10, xpReward: 20, icon: "flashcard" },
];

const WEEKLY_CHALLENGES: ChallengeDef[] = [
  { id: "weekly_streak", type: "weekly", title: "Weekly Warrior", desc: "Maintain a 5-day streak", goal: 5, xpReward: 100, icon: "streak" },
  { id: "weekly_exercises", type: "weekly", title: "Exercise Champion", desc: "Complete 20 exercises", goal: 20, xpReward: 80, icon: "exercise" },
  { id: "weekly_words", type: "weekly", title: "Vocabulary Builder", desc: "Save 20 new words", goal: 20, xpReward: 75, icon: "vocab" },
  { id: "weekly_quizzes", type: "weekly", title: "Quiz King", desc: "Score 90%+ on 3 quizzes", goal: 3, xpReward: 90, icon: "quiz" },
  { id: "weekly_stories", type: "weekly", title: "Story Seeker", desc: "Read 10 stories", goal: 10, xpReward: 85, icon: "read" },
  { id: "weekly_xp", type: "weekly", title: "XP Hunter", desc: "Earn 500 XP in a week", goal: 500, xpReward: 120, icon: "xp" },
  { id: "weekly_all_exercises", type: "weekly", title: "All-Rounder", desc: "Complete every exercise type", goal: 6, xpReward: 150, icon: "all" },
  { id: "weekly_accuracy", type: "weekly", title: "Accuracy Ace", desc: "Average 85%+ on all quizzes", goal: 85, xpReward: 100, icon: "accuracy" },
];

// Store the active challenges
export const activeChallenges = map<Record<string, ChallengeDef & { progress: number; completed: boolean }>>({});

// Track daily exercise completions for progress backing
export const dailyProgress = map<Record<string, number>>({});

function getDailySeed(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeeklySeed(): string {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  return startOfWeek.toISOString().split("T")[0];
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const shuffled = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash) + 1;
    hash |= 0;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function generateChallenges() {
  const dailySeed = getDailySeed();
  const weeklySeed = getWeeklySeed();

  const selectedDaily = seededShuffle(DAILY_CHALLENGES, dailySeed).slice(0, 3);
  const selectedWeekly = seededShuffle(WEEKLY_CHALLENGES, weeklySeed).slice(0, 2);

  const all: Record<string, ChallengeDef & { progress: number; completed: boolean }> = {};

  for (const c of selectedDaily) {
    const saved = await db.challenges.get(`${dailySeed}_${c.id}`);
    all[c.id] = {
      ...c,
      progress: saved?.progress ?? 0,
      completed: saved?.completed ?? false,
    };
  }

  for (const c of selectedWeekly) {
    const saved = await db.challenges.get(`${weeklySeed}_${c.id}`);
    all[c.id] = {
      ...c,
      progress: saved?.progress ?? 0,
      completed: saved?.completed ?? false,
    };
  }

  activeChallenges.set(all);
}

export async function updateChallengeProgress(challengeId: string, amount: number) {
  const current = activeChallenges.get();
  const challenge = current[challengeId];
  if (!challenge || challenge.completed) return;

  const newProgress = Math.min(challenge.progress + amount, challenge.goal);
  const justCompleted = newProgress >= challenge.goal && !challenge.completed;

  activeChallenges.setKey(challengeId, { ...challenge, progress: newProgress, completed: justCompleted });

  // Persist to DB first so achievement count includes this challenge
  const seed = challenge.type === "daily" ? getDailySeed() : getWeeklySeed();
  await db.challenges.put({
    id: `${seed}_${challenge.id}`,
    seed,
    challengeId: challenge.id,
    type: challenge.type,
    progress: newProgress,
    completed: justCompleted,
    completedAt: justCompleted ? Date.now() : undefined,
  });

  if (justCompleted) {
    await addXP(challenge.xpReward, `challenge_${challengeId}`);

    // Unlock challenge achievements (count after DB write)
    const allChallenges = await db.challenges.toArray();
    const completedCount = allChallenges.filter(c => c.completed).length;
    if (completedCount >= 1) await unlockAchievement("challenge_1");
    if (completedCount >= 10) await unlockAchievement("challenge_10");
    if (completedCount >= 50) await unlockAchievement("challenge_50");
  }
}

export function getChallengeProgress(): { daily: number; weekly: number; totalDaily: number; totalWeekly: number } {
  const challenges = activeChallenges.get();
  const all = Object.values(challenges);
  const daily = all.filter(c => c.type === "daily");
  const weekly = all.filter(c => c.type === "weekly");
  return {
    daily: daily.filter(c => c.completed).length,
    weekly: weekly.filter(c => c.completed).length,
    totalDaily: daily.length,
    totalWeekly: weekly.length,
  };
}

export function getTotalChallengesCompleted(challenges: Record<string, ChallengeDef & { progress: number; completed: boolean }>): number {
  return Object.values(challenges).filter(c => c.completed).length;
}
