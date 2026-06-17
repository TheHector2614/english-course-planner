import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { focusMode } from "../../stores/modes";
import type { FocusMode } from "../../stores/modes";

const TABS: { id: string; label: string; focuses: FocusMode[]; icon: string }[] = [
  { id: "core", label: "Core Grammar", focuses: ["general"], icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { id: "business", label: "Business Skills", focuses: ["business"], icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-6 2h-2m4 0h2m-2 2v4m-4-4h-2m4 0h2m-8 4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m12 14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4z" },
  { id: "tech", label: "Tech Terms", focuses: ["technology"], icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { id: "practice", label: "Practice", focuses: ["general", "business", "technology"], icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "progress", label: "Progress", focuses: ["general", "business", "technology"], icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
];

export default function LevelTabBar() {
  const activeFocus = useStore(focusMode);
  const visibleTabs = TABS.filter((t) => t.focuses.includes(activeFocus));

  const [activeTab, setActiveTab] = useState("core");

  const switchTab = (id: string) => {
    setActiveTab(id);
    document.querySelectorAll("[data-tab]").forEach((el) => {
      const tabEl = el as HTMLElement;
      tabEl.classList.toggle("hidden", tabEl.getAttribute("data-tab") !== id);
    });
    document.querySelectorAll("[data-tab-btn]").forEach((el) => {
      const btnEl = el as HTMLElement;
      const isActive = btnEl.getAttribute("data-tab-btn") === id;
      btnEl.classList.toggle("bg-focus-accent", isActive);
      btnEl.classList.toggle("text-white", isActive);
      btnEl.classList.toggle("shadow-sm", isActive);
      btnEl.classList.toggle("text-text-secondary", !isActive);
    });
  };

  useEffect(() => {
    const defaultTab = visibleTabs[0]?.id || "core";
    setActiveTab(defaultTab);
    switchTab(defaultTab);
  }, [activeFocus]);

  return (
    <div className="glass-blur border border-border p-1 rounded-full flex gap-1 mb-8 overflow-x-auto min-h-12 items-center" role="tablist">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          data-tab-btn={tab.id}
          role="tab"
          onClick={() => switchTab(tab.id)}
          className={`flex items-center justify-center gap-2 whitespace-nowrap min-h-10 px-5 py-2 text-sm font-bold transition-all rounded-full active-scale ${
            tab.id === activeTab
              ? "bg-focus-accent text-white shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-alt"
          }`}
          aria-selected={tab.id === activeTab}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
