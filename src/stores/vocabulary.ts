import { atom, map } from "nanostores";
import { db, type SavedWord, sm2Schedule } from "./db";
import { unlockAchievement } from "./achievements";
import { updateChallengeProgress } from "./challenges";
import {
  INITIAL_EASE_FACTOR,
  VOCAB_THRESHOLD_10,
  VOCAB_THRESHOLD_50,
  VOCAB_THRESHOLD_100,
} from "../constants";

export const vocabularyList = map<Record<number, SavedWord>>({});
export const vocabularyLoading = atom<boolean>(true);
export const vocabFilter = atom<string>("all");

export async function loadVocabulary() {
  vocabularyLoading.set(true);
  try {
    const words = await db.vocabulary.orderBy("savedAt").reverse().toArray();
    const map: Record<number, SavedWord> = {};
    for (const w of words) {
      if (w.id) map[w.id] = w;
    }
    vocabularyList.set(map);
  } catch (e) {
    console.error("Failed to load vocabulary:", e);
  } finally {
    vocabularyLoading.set(false);
  }
}

export async function saveWord(word: Omit<SavedWord, "id" | "savedAt" | "easeFactor" | "interval" | "repetitions" | "nextReview">) {
  return await db.transaction("rw", [db.vocabulary, db.achievements, db.settings, db.challenges], async () => {
    const entry: Omit<SavedWord, "id"> = {
      ...word,
      easeFactor: INITIAL_EASE_FACTOR,
      interval: 0,
      nextReview: Date.now(),
      repetitions: 0,
      savedAt: Date.now(),
    };
    const id = await db.vocabulary.add(entry as SavedWord);
    const saved = await db.vocabulary.get(id);
    if (saved) {
      vocabularyList.set({ ...vocabularyList.get(), [id]: saved });
    }
    const count = await db.vocabulary.count();
    if (count >= VOCAB_THRESHOLD_10) await unlockAchievement("vocab_10");
    if (count >= VOCAB_THRESHOLD_50) await unlockAchievement("vocab_50");
    if (count >= VOCAB_THRESHOLD_100) await unlockAchievement("vocab_100");

    await updateChallengeProgress("daily_save_words", 1);
    await updateChallengeProgress("weekly_words", 1);

    return id;
  });
}

export async function updateWord(id: number, updates: Partial<SavedWord>) {
  await db.vocabulary.update(id, updates);
  const updated = await db.vocabulary.get(id);
  if (updated) {
    vocabularyList.set({ ...vocabularyList.get(), [id]: updated });
  }
}

export async function reviewWord(id: number, quality: number) {
  const word = await db.vocabulary.get(id);
  if (!word) return;
  const { easeFactor, interval, repetitions, nextReview } = sm2Schedule(
    quality,
    word.easeFactor,
    word.interval,
    word.repetitions,
    word.nextReview
  );
  await db.vocabulary.update(id, {
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: Date.now(),
  });
  const updated = await db.vocabulary.get(id);
  if (updated) {
    vocabularyList.set({ ...vocabularyList.get(), [id]: updated });
  }
}

export async function deleteWord(id: number) {
  await db.vocabulary.delete(id);
  const map = { ...vocabularyList.get() };
  delete map[id];
  vocabularyList.set(map);
}

export async function getDueWords(): Promise<SavedWord[]> {
  return db.vocabulary.where("nextReview").belowOrEqual(Date.now()).toArray();
}

export function getVocabularyByLevel(level: string): SavedWord[] {
  return Object.values(vocabularyList.get()).filter((w) => w.level === level);
}

export function getVocabularyByTag(tag: string): SavedWord[] {
  return Object.values(vocabularyList.get()).filter((w) => w.tags.includes(tag));
}
