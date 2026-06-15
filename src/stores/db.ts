import Dexie, { type Table } from "dexie";

export interface SavedWord {
  id?: number;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  level: string;
  tags: string[];
  easeFactor: number;
  interval: number;
  nextReview: number;
  repetitions: number;
  lastReview?: number;
  savedAt: number;
  notes?: string;
}

export interface QuizScore {
  quizId: string;
  score: number;
  total: number;
  passed: boolean;
  answers: number[];
  timestamp: number;
}

export interface LevelProgress {
  levelId: string;
  unitsCompleted: number;
  unitProgress: Record<string, number>;
  quizScores: QuizScore[];
  bestScore: number;
  completed: boolean;
  completedAt?: number;
}

export interface StudySession {
  id?: number;
  date: string;
  duration: number;
  xpEarned: number;
  wordsLearned: number;
  exercisesCompleted: number;
}

export interface Achievement {
  id: string;
  unlockedAt: number;
  seen: boolean;
}

export interface StoryProgress {
  storyId: string;
  level: string;
  completed: boolean;
  comprehensionScore: number;
  lastReadPosition: number;
  vocabularySaved: string[];
  completedAt?: number;
}

export interface UserSettings {
  id: string;
  name: string;
  nativeLang: string;
  theme: "light" | "dark";
  xp: number;
  streak: number;
  lastStudyDate: string;
  created: number;
}

export const ACHIEVEMENT_DEFS: Record<string, { title: string; desc: string }> = {
  first_quiz:    { title: "First Steps",       desc: "Complete your first quiz" },
  streak_3:      { title: "Getting Started",    desc: "3-day study streak" },
  streak_7:      { title: "Week Warrior",       desc: "7-day study streak" },
  streak_30:     { title: "Unstoppable",        desc: "30-day study streak" },
  vocab_10:      { title: "Collector",          desc: "Save 10 words" },
  vocab_50:      { title: "Lexicon Builder",    desc: "Save 50 words" },
  vocab_100:     { title: "Polyglot in Making", desc: "Save 100 words" },
  perfect_quiz:  { title: "Perfect Score",      desc: "Get 100% on any quiz" },
  all_levels:    { title: "Course Complete",    desc: "Complete all 6 levels" },
  crossword_1:   { title: "Word Detective",     desc: "Complete your first crossword" },
  reading_5:     { title: "Bookworm",           desc: "Read 5 stories" },
  reading_20:    { title: "Avid Reader",        desc: "Read 20 stories" },
};

export class CourseDB extends Dexie {
  vocabulary!: Table<SavedWord, number>;
  levelProgress!: Table<LevelProgress, string>;
  sessions!: Table<StudySession, number>;
  achievements!: Table<Achievement, string>;
  stories!: Table<StoryProgress, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super("EnglishCourseDB");
    this.version(1).stores({
      vocabulary: "++id, word, level, nextReview, tags",
      levelProgress: "levelId",
      sessions: "++id, date",
      achievements: "id",
      stories: "storyId",
      settings: "id",
    });
  }
}

export const db = new CourseDB();

export async function initSettings(): Promise<UserSettings> {
  const existing = await db.settings.get("default");
  if (existing) return existing;
  const settings: UserSettings = {
    id: "default",
    name: "Student",
    nativeLang: "es",
    theme: "light",
    xp: 0,
    streak: 0,
    lastStudyDate: "",
    created: Date.now(),
  };
  await db.settings.put(settings);
  return settings;
}

// SM-2 Algorithm
export function sm2Schedule(
  quality: number,
  prevEaseFactor: number,
  prevInterval: number,
  prevRepetitions: number
): { easeFactor: number; interval: number; repetitions: number; nextReview: number } {
  let easeFactor = prevEaseFactor;
  let interval: number;
  let repetitions: number;

  if (quality >= 3) {
    if (prevRepetitions === 0) {
      interval = 1;
    } else if (prevRepetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEaseFactor);
    }
    repetitions = prevRepetitions + 1;
  } else {
    interval = 1;
    repetitions = 0;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = Date.now() + interval * 86400000;

  return { easeFactor, interval, repetitions, nextReview };
}
