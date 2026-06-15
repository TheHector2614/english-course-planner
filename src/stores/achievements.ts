import { atom, map } from "nanostores";
import { db, ACHIEVEMENT_DEFS, type Achievement } from "./db";

export const unlockedAchievements = map<Record<string, Achievement>>({});
export const showAchievementModal = atom<string | null>(null);

export async function loadAchievements() {
  try {
    const list = await db.achievements.toArray();
    const map: Record<string, Achievement> = {};
    for (const a of list) {
      map[a.id] = a;
    }
    unlockedAchievements.set(map);
  } catch (e) {
    console.error("Failed to load achievements:", e);
  }
}

export async function unlockAchievement(id: string): Promise<boolean> {
  if (unlockedAchievements.get()[id]) return false;
  const achievement: Achievement = {
    id,
    unlockedAt: Date.now(),
    seen: false,
  };
  await db.achievements.put(achievement);
  unlockedAchievements.set({ ...unlockedAchievements.get(), [id]: achievement });
  showAchievementModal.set(id);
  return true;
}

export function dismissAchievement() {
  showAchievementModal.set(null);
}

export async function markSeen(id: string) {
  await db.achievements.update(id, { seen: true });
  const current = unlockedAchievements.get();
  if (current[id]) {
    unlockedAchievements.set({ ...current, [id]: { ...current[id], seen: true } });
  }
}

export function getAchievementDefs() {
  return ACHIEVEMENT_DEFS;
}

export function getUnlockedCount(): number {
  return Object.keys(unlockedAchievements.get()).length;
}

export function getTotalAchievements(): number {
  return Object.keys(ACHIEVEMENT_DEFS).length;
}
