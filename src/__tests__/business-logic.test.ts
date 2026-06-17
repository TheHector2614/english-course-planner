import { describe, it, expect, vi } from "vitest";
import { sm2Schedule } from "../stores/db";
import { getLevelFromXp, getXpForNextLevel, xp, getProgressPercent, completedLevels, updateStreak, streak, lastStudyDate } from "../stores/progress";

vi.mock("../stores/db", async () => {
  const original = await vi.importActual("../stores/db") as any;
  return {
    ...original,
    db: new Proxy({}, {
      get() {
        return {
          update: () => Promise.resolve({}),
          get: () => Promise.resolve(null),
          put: () => Promise.resolve({}),
          add: () => Promise.resolve({}),
          delete: () => Promise.resolve({}),
          toArray: () => Promise.resolve([]),
        };
      }
    }),
  };
});

describe("SM-2 Spaced Repetition Scheduling", () => {
  it("should schedule interval=1 for the first successful review (quality >= 3)", () => {
    const res = sm2Schedule(4, 2.5, 0, 0);
    expect(res.interval).toBe(1);
    expect(res.repetitions).toBe(1);
    expect(res.easeFactor).toBeGreaterThan(2.3);
  });

  it("should schedule interval=6 for the second successful review", () => {
    const res = sm2Schedule(4, 2.5, 1, 1);
    expect(res.interval).toBe(6);
    expect(res.repetitions).toBe(2);
  });

  it("should scale interval by ease factor for repetitions > 1", () => {
    const res = sm2Schedule(5, 2.6, 6, 2);
    expect(res.interval).toBe(Math.round(6 * 2.6));
    expect(res.repetitions).toBe(3);
  });

  it("should reset interval to 1 and repetitions to 0 on quality < 3", () => {
    const res = sm2Schedule(2, 2.5, 6, 2);
    expect(res.interval).toBe(1);
    expect(res.repetitions).toBe(0);
  });

  it("should clamp ease factor to a minimum of 1.3", () => {
    const res = sm2Schedule(0, 1.3, 1, 1);
    expect(res.easeFactor).toBe(1.3);
  });

  it("should base nextReview on prevNextReview when repetitions > 0 to prevent late review penalties", () => {
    const base = Date.now() - 5 * 86400000; // Reviewed 5 days late
    const res = sm2Schedule(4, 2.5, 1, 1, base);
    expect(res.nextReview).toBe(base + 6 * 86400000);
  });
});

describe("CEFR Level Calculations from XP", () => {
  it("should map XP to CEFR levels 1 to 6 correctly", () => {
    // Set mock store state
    xp.set(0);
    expect(getLevelFromXp()).toBe(1);

    xp.set(600);
    expect(getLevelFromXp()).toBe(2);

    xp.set(1600);
    expect(getLevelFromXp()).toBe(3);

    xp.set(4000);
    expect(getLevelFromXp()).toBe(4);

    xp.set(6000);
    expect(getLevelFromXp()).toBe(5);

    xp.set(9000);
    expect(getLevelFromXp()).toBe(6);
  });

  it("should return the correct next level goal thresholds", () => {
    xp.set(0);
    expect(getXpForNextLevel()).toBe(500);

    xp.set(600);
    expect(getXpForNextLevel()).toBe(1500);

    xp.set(1600);
    expect(getXpForNextLevel()).toBe(3000);

    xp.set(4000);
    expect(getXpForNextLevel()).toBe(5000);

    xp.set(6000);
    expect(getXpForNextLevel()).toBe(8000);

    xp.set(9000);
    expect(getXpForNextLevel()).toBe(12000);
  });
});

describe("Course Progress and Streaks", () => {
  it("should calculate progress percentage accurately based on completed levels", () => {
    completedLevels.set({});
    expect(getProgressPercent()).toBe(0);

    completedLevels.set({ a1: true, a2: true });
    expect(getProgressPercent()).toBe(33); // 2/6 * 100 = 33.33... -> 33

    completedLevels.set({ a1: true, a2: true, b1: true, "b1+": true, b2: true, "b2+": true });
    expect(getProgressPercent()).toBe(100);
  });

  it("should handle streak updating logic based on consecutive days", async () => {
    // Case 1: First study day, streak starts at 1
    lastStudyDate.set("");
    streak.set(0);
    await updateStreak();
    expect(streak.get()).toBe(1);

    // Case 2: Consecutive day study, streak increments
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    lastStudyDate.set(yesterday);
    streak.set(4);
    await updateStreak();
    expect(streak.get()).toBe(5);
    expect(lastStudyDate.get()).toBe(today);

    // Case 3: Same day study, streak remains unchanged
    lastStudyDate.set(today);
    streak.set(5);
    await updateStreak();
    expect(streak.get()).toBe(5);

    // Case 4: Broken streak (e.g. 2 days ago), streak resets to 1
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
    lastStudyDate.set(twoDaysAgo);
    streak.set(5);
    await updateStreak();
    expect(streak.get()).toBe(1);
  });
});
