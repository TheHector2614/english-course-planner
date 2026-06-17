import React, { useState, useEffect } from "react";

export default function SelectionReader() {
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionInfo(null);
        return;
      }
      
      const text = selection.toString().trim();
      // Only display the listen trigger if we have a substantial phrase (>= 2 characters)
      if (!text || text.length < 2) {
        setSelectionInfo(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Position just above the horizontal center of the highlighted selection bounding box
        setSelectionInfo({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top - 40,
        });
      } catch (e) {
        setSelectionInfo(null);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const playSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectionInfo) return;
    
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectionInfo.text);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Slightly slower, clear pacing for English language learners
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = 
        voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("natural")) ||
        voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("google")) ||
        voices.find(v => v.lang.startsWith("en-") && v.name.toLowerCase().includes("natural")) ||
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang.startsWith("en"));
        
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!selectionInfo) return null;

  return (
    <button
      onClick={playSelection}
      onMouseDown={(e) => e.preventDefault()} // Critical: prevents focus shift which collapses text selection
      className="fixed z-50 flex items-center gap-1.5 rounded-full bg-text px-3.5 py-1.5 text-xs font-bold text-surface shadow-lg active-scale transition-all animate-fade-in-scale border border-border"
      style={{
        left: Math.max(15, Math.min(selectionInfo.x, window.innerWidth - 85)),
        top: Math.max(15, selectionInfo.y),
        transform: "translateX(-50%)",
      }}
      title="Listen to highlighted text"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        <path d="M16.5 12a3 3 0 0 0-1.5-2.6v5.2a3 3 0 0 0 1.5-2.6zm3 0a6 6 0 0 0-3-5.2v10.4a6 6 0 0 0 3-5.2z" />
      </svg>
      Listen
    </button>
  );
}
