import { loadTheme } from "../stores/theme";
import { loadLang } from "../stores/lang";
import { loadFromStorage } from "../stores/progress";
import { loadVocabulary } from "../stores/vocabulary";
import { loadAchievements } from "../stores/achievements";

loadTheme();
loadLang();
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
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    const banner = document.createElement("div");
                    banner.className = "fixed bottom-6 left-6 right-6 md:left-auto md:max-w-sm z-50 glass-card rounded-xl p-4 shadow-2xl border border-border flex flex-col gap-3 animate-slide-down";
                    banner.style.background = "color-mix(in oklch, var(--surface) 90%, transparent)";
                    banner.style.backdropFilter = "blur(12px)";
                    banner.innerHTML = `
                      <div class="flex items-start gap-3">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg" style="background: var(--focus-accent-bg); color: var(--focus-accent)">
                          ✨
                        </div>
                        <div>
                          <p class="text-sm font-bold text-text">New version available!</p>
                          <p class="text-xs text-text-secondary mt-0.5">An update has been downloaded. Reload to see what's new.</p>
                        </div>
                      </div>
                      <div class="flex justify-end gap-2 mt-1">
                        <button id="sw-dismiss" class="min-h-9 px-4 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-surface-alt transition-colors">Dismiss</button>
                        <button id="sw-reload" class="min-h-9 px-4 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90" style="background: var(--focus-accent)">Reload</button>
                      </div>
                    `;
                    document.body.appendChild(banner);
                    document.getElementById("sw-dismiss")?.addEventListener("click", () => banner.remove());
                    document.getElementById("sw-reload")?.addEventListener("click", () => window.location.reload());
                  }
                }
              });
            }
          });
        })
        .catch(() => {});
    }
  });
}
