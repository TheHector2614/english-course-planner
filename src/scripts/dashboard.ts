import { xp, streak, quizResults, completedLevels, getXpForNextLevel, getLevelFromXp } from "../stores/progress";
import { levelMode, focusMode, FOCUS_LABELS } from "../stores/modes";
import { vocabularyList } from "../stores/vocabulary";
import { unlockedAchievements, getAchievementDefs } from "../stores/achievements";

function updateDashboard() {
  const currentXp = xp.get();
  const currentStreak = streak.get();
  const vocabCount = Object.keys(vocabularyList.get()).length;
  const completed = completedLevels.get();
  const completedCount = Object.values(completed).filter(Boolean).length;
  const xpNext = getXpForNextLevel();
  const level = getLevelFromXp();

  // Stats
  const el = (id: string) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Element with id ${id} not found`);
    return element;
  };

  try {
    el("streak-value").textContent = currentStreak + " day" + (currentStreak !== 1 ? "s" : "");
    el("xp-value").textContent = currentXp.toLocaleString();
    el("vocab-value").textContent = vocabCount + " word" + (vocabCount !== 1 ? "s" : "");
    el("levels-value").textContent = completedCount + "/6";
    el("user-level").textContent = String(level);
    el("xp-progress-text").textContent = currentXp + " / " + xpNext + " XP";
    el("xp-bar").style.width = Math.min(100, (currentXp / xpNext) * 100) + "%";

    // Level bars
    const levelIds = ["a1", "a2", "b1", "b1+", "b2", "b2+"];
    levelIds.forEach(function(l) {
      const bar = document.getElementById("bar-" + l);
      const pct = document.getElementById("pct-" + l);
      if (bar && pct) {
        const done = completed[l as any] || false;
        bar.style.width = done ? "100%" : "0%";
        pct.textContent = done ? "100%" : "0%";
      }
    });

    // Achievements
    const defs = getAchievementDefs();
    const unlocked = unlockedAchievements.get();
    const unlockedCount = Object.keys(unlocked).length;
    const totalCount = Object.keys(defs).length;
    el("achv-count").textContent = unlockedCount + " / " + totalCount;

    const grid = el("achievement-grid");
    grid.innerHTML = Object.entries(defs).map(function(entry) {
      const id = entry[0], def = entry[1];
      const isUnlocked = !!unlocked[id];
      const cardStyle = isUnlocked 
        ? 'style="border: 1px solid color-mix(in oklch, var(--warning) 35%, transparent); background: color-mix(in oklch, var(--warning) 6%, transparent); box-shadow: 0 4px 12px -2px color-mix(in oklch, var(--warning) 15%, transparent)"' 
        : 'style="border: 1px solid var(--border-light); background: color-mix(in oklch, var(--surface-alt) 40%, transparent)"';
      const opacityClass = isUnlocked ? "hover:-translate-y-0.5 hover:shadow-md transition-all duration-300" : "opacity-45";
      const iconBg = isUnlocked 
        ? 'style="background: color-mix(in oklch, var(--warning) 18%, transparent)"' 
        : 'style="background: var(--border-light)"';
      return (
        '<div class="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-3 text-center active-scale ' + opacityClass + '" ' + cardStyle + '>' +
          '<div class="flex h-8 w-8 items-center justify-center rounded-full" ' + iconBg + '>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isUnlocked ? "var(--warning)" : "none") + '" stroke="' + (isUnlocked ? "var(--warning)" : "var(--text-muted)") + '" stroke-width="2">' +
              '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
            "</svg>" +
          "</div>" +
          '<span class="text-xs font-bold ' + (isUnlocked ? "text-text" : "text-text-muted") + '">' + def.title + "</span>" +
          '<span class="text-[10px] text-text-muted leading-tight">' + def.desc + "</span>" +
        "</div>"
      );
    }).join("");

    // Recent activity
    const activity = el("recent-activity");
    const items = [];
    if (currentStreak > 0) items.push("Study streak: " + currentStreak + " days");
    if (completedCount > 0) items.push("Levels: " + completedCount + "/6 completed");
    if (vocabCount > 0) items.push("Vocabulary: " + vocabCount + " words saved");
    if (unlockedCount > 0) items.push("Achievements: " + unlockedCount + " unlocked");
    const quizCount = Object.keys(quizResults.get()).length;
    if (quizCount > 0) items.push("Quizzes: " + quizCount + " taken");

    activity.innerHTML = items.length > 0
      ? items.map(function(r) { return '<div class="flex items-center gap-2 text-sm"><span class="text-text-secondary">' + r + "</span></div>"; }).join("")
      : '<p class="text-sm text-text-muted">No activity yet. Complete a quiz or read a story to get started!</p>';
  } catch (err) {
    console.error("Dashboard render error:", err);
  }
}

// Update mode badge
function updateMode() {
  const badge = document.getElementById("dash-mode-badge");
  if (badge) badge.textContent = levelMode.get().toUpperCase() + " · " + FOCUS_LABELS[focusMode.get()].split(" ")[0];
}

levelMode.subscribe(updateMode);
focusMode.subscribe(updateMode);
updateMode();

// Subscribe and update
xp.subscribe(updateDashboard);
streak.subscribe(updateDashboard);
vocabularyList.subscribe(updateDashboard);
completedLevels.subscribe(updateDashboard);
unlockedAchievements.subscribe(updateDashboard);
updateDashboard();
