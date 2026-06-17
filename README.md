# 🎓 English Course Planner

An interactive, premium English learning platform (CEFR A1 to B2+) built with **Astro 6**, **React 19**, and vanilla CSS utilizing custom design systems. The platform implements dynamic islands for vocabulary lookups, interactive writing exercises, reading comprehension blocks, and automatic speech synthesis.

---

## 🏗️ Project Architecture & Layout

The project follows a standard Astro project structure with React components serving as interactive "islands".

```
d:/IA_ENGLISH/project/
├── src/
│   ├── components/
│   │   ├── learn/
│   │   │   ├── ClickableText.tsx       # Word lookup engine (portaled overlays, translation & audio)
│   │   │   ├── SelectionReader.tsx     # Floating selection-to-speech text reader
│   │   │   ├── LearningUnit.tsx        # Main unit parser (Theory, Exercises, Evaluation tabs)
│   │   │   └── ExerciseRenderer.tsx    # Quiz, MCQ, Sentence transformation engine
│   │   ├── interactive/                # Auxiliary vocabulary lookup & correction components
│   │   └── layout/                     # Header, Footer, and Theme controllers
│   ├── layouts/
│   │   └── BaseLayout.astro            # Global template (enforces CSP, SEO, and preloader scripts)
│   ├── pages/
│   │   ├── learn/
│   │   │   └── [level]/
│   │   │       └── [unit].astro        # Dynamic router for curriculum units
│   │   ├── level/
│   │   │   └── [level].astro           # Dashboard listing topics, exercises, and progress
│   │   └── index.astro                 # Main entry homepage
│   ├── stores/
│   │   ├── db.ts                       # IndexedDB schema (Dexie cache storage for dictionary entries)
│   │   ├── progress.ts                 # XP tracking, level state, and persistent progress stores
│   │   └── vocabulary.ts               # Saved vocabulary flashcard collection state
│   └── styles/
│       ├── global.css                  # Typography, light/dark modes, and base variables
│       └── learn.css                   # Premium tables, navigation pills, and tooltip layouts
└── astro.config.mjs                    # Vite bundler options & Tailwind configurations
```

---

## 🌟 Key Features

### 1. Interactive Word Lookups (`ClickableText`)
*   **Tokenized Span Parser**: Automatically splits plain-text paragraphs into individual clickable word tokens.
*   **Dual-API Fetching**: Queries the Free Dictionary API for definitions/phonetics, and Google Translate (via a CORS proxy wrapper) for Spanish translations in parallel.
*   **IndexedDB Cache**: Saves retrieved definitions in a local client-side database (`db.dictionaryCache` using Dexie) for instant offline lookups.
*   **React Portal Overlay**: Appends tooltip bubbles directly to `document.body` to bypass relative layout translations (`transform: translateY`).
*   **Self-Aligning Tooltips**: Computes coordinate bounding rects to position tooltips below a word if clicked in the upper half of the viewport, or above a word if clicked in the lower half. Includes a responsive pointer arrow aligned with the word.

### 2. Highlight & Listen Reader (`SelectionReader`)
*   **Highlight Detection**: Listens to global document-wide text selection changes.
*   **Floating Audio Bubble**: Displays a floating `🔊 Listen` button directly centered above highlighted sentences.
*   **Event Prevention**: Stops focus shifts via `onMouseDown` preventDefault so browser text selection does not collapse.
*   **Natural TTS Engines**: Utilizes `SpeechSynthesisUtterance` set to a clear, slow pacing rate (`0.85`), prioritizing natural English accent voices.

### 3. Unified Exercise Engine (`ExerciseRenderer`)
*   Provides structured learning island panels:
    *   **Multiple Choice Questions (MCQ)**: Option matrices.
    *   **Fill in the Blanks**: Dynamic inputs matching target strings.
    *   **Sentence Reordering**: Word-chip sorting exercises.
    *   **Error Correction**: Side-by-side comparative sentence reviews.

---

## 🛠️ Development & Production Commands

All server and compilation commands are managed via `npm` scripts in [package.json](file:///d:/IA_ENGLISH/project/package.json):

```bash
# 1. Install dependencies
npm install

# 2. Run local hot-reloaded development server
npm run dev

# 3. Compile static distribution build
npm run build

# 4. Preview static production output
npm run preview
```

---

## 📐 CEFR Level Mapping

The curriculum is structured logically across six CEFR target profiles:

| Profile | Level | Recommended Hours | Core Focus |
| :--- | :--- | :--- | :--- |
| **A1** | Beginner | 8 hours | Pronouns, basic conjugations, introductions |
| **A2** | Elementary | 10 hours | Simple past, routines, future planning |
| **B1** | Intermediate | 12 hours | Perfect tenses, conditional structures |
| **B1+** | Upper-Intermediate | 12 hours | Complex sentences, idioms, opinions |
| **B2** | Advanced | 14 hours | Argumentative speech, literature, passive voice |
| **B2+** | Pre-Mastery | 14 hours | Subtle styling, academic writing, business logic |
