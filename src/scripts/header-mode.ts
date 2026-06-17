import { levelMode, focusMode, FOCUS_LABELS, setFocusMode, setLevelMode } from "../stores/modes";
import type { FocusMode, LevelMode } from "../stores/modes";

const FOCUS_CYCLE: FocusMode[] = ["general", "business", "technology"];
const LEVEL_CYCLE: LevelMode[] = ["a1", "a2", "b1", "b1+", "b2", "b2+"];

const updateHeader = () => {
  const levelEl = document.getElementById("header-level-display");
  const focusEl = document.getElementById("header-focus-display");
  if (levelEl) levelEl.textContent = levelMode.get().toUpperCase();
  if (focusEl) focusEl.textContent = FOCUS_LABELS[focusMode.get()].split(" ")[0];
};

levelMode.subscribe(updateHeader);
focusMode.subscribe(updateHeader);
updateHeader();

const badge = document.getElementById("header-mode-badge");
if (badge) {
  badge.addEventListener("click", (e) => {
    if (e.shiftKey) {
      const cur = levelMode.get();
      const idx = LEVEL_CYCLE.indexOf(cur);
      const next = LEVEL_CYCLE[(idx + 1) % LEVEL_CYCLE.length];
      setLevelMode(next);
    } else {
      const cur = focusMode.get();
      const idx = FOCUS_CYCLE.indexOf(cur);
      const next = FOCUS_CYCLE[(idx + 1) % FOCUS_CYCLE.length];
      setFocusMode(next);
    }
  });
}
