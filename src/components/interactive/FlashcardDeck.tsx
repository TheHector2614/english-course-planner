import { useState } from "react";

interface Card {
  front: string;
  back: string;
  example: string;
}

interface Props {
  cards: Card[];
}

export default function FlashcardDeck({ cards }: Props) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleCard = (i: number) => {
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => toggleCard(i)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(i); } }}
          class="group relative h-44 w-full cursor-pointer rounded-xl border-2 border-border bg-surface p-4 text-center shadow-sm transition-all hover:shadow-md"
          style={{ perspective: "800px" }}
          aria-label={flipped[i] ? `Definition: ${card.back}` : `Word: ${card.front}`}
        >
          <div
            class="relative h-full w-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              class="absolute inset-0 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p class="text-lg font-bold">{card.front}</p>
              <p class="mt-1 text-xs text-text-muted">Tap to flip</p>
            </div>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center backface-hidden"
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
            >
              <p class="text-base font-semibold">{card.back}</p>
              <p class="mt-2 text-xs text-text-secondary italic">{card.example}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
