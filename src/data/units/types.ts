// ───────────────────────────────────────────────
// Shared Types for Learning Units (CEFR A1 - B2+)
// ───────────────────────────────────────────────

export type ExerciseItem =
  | { type: "fill-blank"; prompt: string; options: string[]; answer: number; explanation?: string }
  | { type: "mcq"; question: string; options: string[]; answer: number; explanation?: string }
  | { type: "error-spot"; incorrect: string; correct: string; explanation: string }
  | { type: "word-order"; jumbled: string[]; correct: string[]; explanation?: string };

export interface UnitExercise {
  id: string;
  title: string;
  instruction: string;
  items: ExerciseItem[];
}

export interface TheorySection {
  id: string;
  title: string;
  /** Use {word} to mark clickable vocabulary */
  paragraphs: string[];
}

export interface VocabEntry {
  word: string;
  translation: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export interface UnitData {
  id: string;
  title: string;
  level: string;
  description: string;
  sections: TheorySection[];
  exercises: UnitExercise[];
  evaluation: UnitExercise;
  vocabulary: VocabEntry[];
}
