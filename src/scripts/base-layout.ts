import { loadTheme } from "../stores/theme";
import { loadLang } from "../stores/lang";
import { loadFromStorage } from "../stores/progress";
import { loadVocabulary } from "../stores/vocabulary";
import { loadAchievements } from "../stores/achievements";
import { loadMode } from "../stores/modes";

loadTheme();
loadLang();
loadMode();
loadFromStorage();
loadVocabulary();
loadAchievements();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister().then(() => {
            console.log("Service Worker unregistered automatically in development.");
          });
        }
      });
      if (window.caches) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key).then(() => {
              console.log("Caches cleared automatically in development:", key);
            });
          }
        });
      }
    } else {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  });
}
