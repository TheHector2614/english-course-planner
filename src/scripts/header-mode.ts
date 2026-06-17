import { levelMode, focusMode, FOCUS_LABELS } from "../stores/modes";

const updateHeader = () => {
  const levelEl = document.getElementById("header-level-display");
  const focusEl = document.getElementById("header-focus-display");
  if (levelEl) levelEl.textContent = levelMode.get().toUpperCase();
  if (focusEl) focusEl.textContent = FOCUS_LABELS[focusMode.get()].split(" ")[0];
};

levelMode.subscribe(updateHeader);
focusMode.subscribe(updateHeader);
updateHeader();
