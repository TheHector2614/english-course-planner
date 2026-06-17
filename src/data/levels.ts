export type CEFRLevel = "a1" | "a2" | "b1" | "b1+" | "b2" | "b2+";

export interface LevelInfo {
  id: CEFRLevel;
  name: string;      // "A1", "A2", etc.
  label: string;     // "Beginner", "Elementary", etc.
  color: string;     // "a1", "a2", "b1", "b1p", "b2", "b2p"
  hue: number;
  desc: string;      // CEFR level descriptions
  hours: number;
  units: number;
}

export const LEVELS: LevelInfo[] = [
  { id: "a1", name: "A1", label: "Beginner", color: "a1", hue: 150, desc: "Fundamentals: greetings, family, daily routine, directions", hours: 8, units: 4 },
  { id: "a2", name: "A2", label: "Elementary", color: "a2", hue: 220, desc: "Past tense, present continuous, comparatives, shopping", hours: 10, units: 4 },
  { id: "b1", name: "B1", label: "Intermediate", color: "b1", hue: 275, desc: "Present perfect, conditionals, passive, phrasal verbs", hours: 12, units: 4 },
  { id: "b1+", name: "B1+", label: "Upper Intermediate", color: "b1p", hue: 15, desc: "Perfect continuous, 2nd conditional, reported speech", hours: 12, units: 4 },
  { id: "b2", name: "B2", label: "Advanced", color: "b2", hue: 250, desc: "Mixed conditionals, inversion, modal perfects", hours: 14, units: 4 },
  { id: "b2+", name: "B2+", label: "Pre-Advanced", color: "b2p", hue: 185, desc: "Participle clauses, wish, business English", hours: 14, units: 4 }
];

export const LEVEL_LABELS: Record<CEFRLevel, string> = {
  a1: "Beginner",
  a2: "Elementary",
  b1: "Intermediate",
  "b1+": "Upper Intermediate",
  b2: "Advanced",
  "b2+": "Pre-Advanced",
};

export const LEVEL_COLORS: Record<CEFRLevel, string> = {
  a1: "a1",
  a2: "a2",
  b1: "b1",
  "b1+": "b1p",
  b2: "b2",
  "b2+": "b2p",
};
