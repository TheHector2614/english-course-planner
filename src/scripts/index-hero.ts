import { xp, streak } from "../stores/progress";
import { vocabularyList } from "../stores/vocabulary";
import { levelMode } from "../stores/modes";

const updateHeroStats = () => {
  const xpEl = document.getElementById("hero-xp");
  const streakEl = document.getElementById("hero-streak");
  const vocabEl = document.getElementById("hero-vocab");
  const levelEl = document.getElementById("hero-progress-pct");

  if (xpEl) xpEl.textContent = xp.get().toLocaleString();
  if (streakEl) {
    const val = streak.get();
    streakEl.textContent = val + " day" + (val !== 1 ? "s" : "");
  }
  if (vocabEl) {
    const val = Object.keys(vocabularyList.get()).length;
    vocabEl.textContent = val + " word" + (val !== 1 ? "s" : "");
  }
  if (levelEl) {
    levelEl.textContent = `${levelMode.get().toUpperCase()} LEVEL`;
  }
};

xp.subscribe(updateHeroStats);
streak.subscribe(updateHeroStats);
vocabularyList.subscribe(updateHeroStats);
levelMode.subscribe(updateHeroStats);
updateHeroStats();
