# PLAN — English Course Planner (A1 → B2+)

> ✅ **Estado:** Completamente implementado. Este documento define la arquitectura completa del curso: fundamento pedagógico, sistema de datos, ejercicios interactivos, integraciones API y experiencia de aprendizaje.

---

## Índice

1. [Fundamento Pedagógico](#1-fundamento-pedagógico)
2. [Arquitectura General](#2-arquitectura-general)
3. [Sistema de Base de Datos](#3-sistema-de-base-de-datos)
4. [Componentes Interactivos](#4-componentes-interactivos)
5. [Lectura por Niveles](#5-lectura-por-niveles)
6. [Sistema de Vocabulario con API](#6-sistema-de-vocabulario-con-api)
7. [Evaluaciones y Tipos de Ejercicio](#7-evaluaciones-y-tipos-de-ejercicio)
8. [Crucigrama Interactivo](#8-crucigrama-interactivo)
9. [Flashcards con Repetición Espaciada](#9-flashcards-con-repetición-espaciada)
10. [Centro de Recursos](#10-centro-de-recursos)
11. [Progreso, Logros y Retos](#11-progreso-logros-y-retos)
12. [Exportación de Datos](#12-exportación-de-datos)
13. [Roadmap de Implementación](#13-roadmap-de-implementación)
14. [Preguntas para Refinar el Plan](#14-preguntas-para-refinar-el-plan)

---

## 1. Fundamento Pedagógico

### 1.1 Enfoque Metodológico

El curso se sustenta en **tres pilares metodológicos** que ya están configurados en el agente:

| Metodología | Rol en el curso |
|---|---|
| **CLT (Communicative Language Teaching)** | Toda actividad tiene un propósito comunicativo real. No se aprende gramática por aprender — se aprende para saludar, describir, argumentar, negociar. |
| **TBLT (Task-Based Language Teaching)** | Cada unidad culmina en una tarea concreta: escribir un email, hacer una llamada, dar una opinión. El lenguaje es el medio, no el fin. |
| **CEFR (Marco Común Europeo)** | Todo contenido está alineado a descriptores CEFR: A1 puede presentarse, B2 puede argumentar con matices. |

### 1.2 Progresión por Niveles

| Nivel | Horas | Skill focus | CEFR Can-Do |
|---|---|---|---|
| **A1** | 8h | Vocabulario básico, presente simple, preguntas simples | Puede presentarse, hablar de rutina, dar direcciones básicas |
| **A2** | 10h | Pasado simple, presente continuo, comparativos | Puede describir experiencias pasadas, hacer compras, hablar del clima |
| **B1** | 12h | Present perfect, condicionales, voz pasiva | Puede expresar opiniones, hablar de planes, narrar eventos |
| **B1+** | 12h | Perfect continuous, reported speech, 2nd conditional | Puede hipotetizar, reportar lo dicho por otros, hablar de duración |
| **B2** | 14h | Mixed conditionals, inversión, modal perfects | Puede argumentar con precisión, usar lenguaje formal, especular |
| **B2+** | 14h | Participle clauses, wish, business English | Puede persuadir, debatir, escribir formalmente con matices |

### 1.3 Principios de Diseño Instruccional

1. **Input comprensible + 1** (Krashen) — cada nivel asume que el anterior está dominado y añade exactamente una estructura nueva
2. **Andamiaje** — ejercicios guiados → semiguiados → libres
3. **Espaciado** — el vocabulario y la gramática se repiten en intervalos crecientes (SM-2)
4. **Autenticidad** — los textos, audios y situaciones reflejan uso real del idioma
5. **Feedback inmediato** — cada ejercicio interactivo da respuesta correcta con explicación

---

## 2. Arquitectura General

### 2.1 Stack Tecnológico

```
Frontend:   Astro 6 + React 19 + TypeScript
Estilos:    Pure CSS con OKLCH (NO Tailwind)
Estado:     nanostores + Dexie.js (IndexedDB)
APIs externas: Free Dictionary API, Unsplash API, YouTube Data API
Offline:    Service Worker + IndexedDB cache
Build:      Astro static generation → GitHub Pages
```

### 2.2 Estructura de Archivos (Propuesta)

```
src/
├── components/
│   ├── interactive/
│   │   ├── Crossword.tsx              # Crucigrama interactivo
│   │   ├── DictionaryLookup.tsx       # Buscador de palabras vía API
│   │   ├── FlashcardDeck.tsx          # Flashcards con SM-2
│   │   ├── Quiz.tsx                   # Quiz multi-formato
│   │   ├── ReadingViewer.tsx          # Lector interactivo de cuentos
│   │   ├── VocabularyBuilder.tsx      # Constructor de vocabulario personal
│   │   ├── MatchingExercise.tsx       # Arrastrar y soltar (emparejar)
│   │   ├── FillBlankExercise.tsx      # Completar espacios
│   │   ├── SentenceReorder.tsx        # Reordenar palabras/oraciones
│   │   ├── ListeningExercise.tsx      # Ejercicio de escucha (Web Speech API)
│   │   ├── SpeakingPractice.tsx       # Práctica de habla (Speech-to-Text)
│   │   └── WritingExercise.tsx        # Escritura con evaluación
│   ├── dynamics/
│   │   ├── ProgressDashboard.tsx      # Panel de progreso completo
│   │   ├── StreakTracker.tsx          # Racha de estudio diaria
│   │   ├── Achievements.tsx           # Sistema de logros/medallas
│   │   └── SpacedReview.tsx           # Repaso programado SM-2
│   ├── resources/
│   │   ├── YoutubeSection.tsx         # Canales recomendados por nivel
│   │   ├── PodcastSection.tsx         # Podcasts recomendados
│   │   ├── Dictionary.tsx             # Diccionario interno de la página
│   │   └── PdfViewer.tsx              # Visor de PDFs
│   └── layout/
│       ├── Header.astro
│       ├── Footer.astro
│       └── ThemeToggle.tsx
├── stores/
│   ├── progress.ts                    # Progreso del estudiante
│   ├── vocabulary.ts                  # Vocabulario guardado
│   ├── settings.ts                    # Configuración de usuario
│   └── db.ts                          # Capa de IndexedDB (Dexie)
├── pages/
│   ├── index.astro                    # Landing page
│   ├── level/[level].astro            # Página de nivel
│   ├── reading/[level]/[story].astro  # Cuento interactivo
│   ├── dictionary.astro               # Diccionario integrado
│   ├── resources.astro                # Centro de recursos
│   ├── dashboard.astro                # Dashboard personal
│   └── vocabulary.astro               # Vocabulario guardado
├── data/
│   ├── stories/
│   │   ├── a1.json, a2.json, ...
│   ├── crosswords/
│   │   ├── a1.json, a2.json, ...
│   ├── resources/
│   │   ├── youtube.json, podcasts.json, links.json
│   └── vocabulary/
│       ├── a1-core.json, a2-core.json, ...
└── styles/
    └── global.css
```

### 2.3 Flujo de Datos

```
Usuario → Interacción (React component)
                ↓
         nanostores (estado reactivo en memoria)
                ↓
         Dexie.js (IndexedDB persistente en el navegador)
                ↓
     ┌──────────┼──────────┐
     |          |          |
  Progreso  Vocabulario  Config
     |          |          |
     └──────────┼──────────┘
                ↓
         Exportar JSON (descargable)
                ↓
         API externas (Dictionary, Unsplash)
```

---

## 3. Sistema de Base de Datos

### 3.1 Esquema IndexedDB (via Dexie.js)

```typescript
// db.ts — Capa de base de datos

interface UserSettings {
  id: string;              // 'default'
  name: string;
  nativeLang: string;      // 'es' | 'pt' | ...
  targetLang: 'en';
  theme: 'light' | 'dark';
  notifications: boolean;
  created: number;         // timestamp
}

interface LevelProgress {
  levelId: string;         // 'a1', 'a2', ...
  unitsCompleted: number;
  unitProgress: Record<string, number>;  // unitId → %
  quizScores: QuizScore[];
  bestScore: number;
  completed: boolean;
  completedAt?: number;
}

interface QuizScore {
  quizId: string;
  score: number;
  total: number;
  answers: number[];
  timestamp: number;
}

interface SavedWord {
  id?: number;             // autoincrement
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  imageUrl?: string;       // de Unsplash
  audioUrl?: string;       // de Dictionary API
  level: string;           // nivel CEFR aproximado
  tags: string[];          // ['grammar', 'business', 'travel']
  
  // SM-2 spaced repetition
  easeFactor: number;       // default 2.5
  interval: number;         // días hasta próximo repaso
  nextReview: number;       // timestamp
  repetitions: number;      // veces respondido correctamente consecutivo
  lastReview?: number;      // timestamp
  
  savedAt: number;          // timestamp de cuando se guardó
  notes?: string;
}

interface StudySession {
  id?: number;
  date: string;            // '2026-06-15'
  duration: number;        // minutos
  xpEarned: number;
  wordsLearned: number;
  exercisesCompleted: number;
}

interface Achievement {
  id: string;              // 'first_quiz', 'streak_7', 'vocab_50'
  unlockedAt: number;
  seen: boolean;
}

interface StoryProgress {
  storyId: string;
  completed: boolean;
  comprehensionScore: number;
  lastReadPosition: number;  // carácter donde quedó
  vocabularySaved: string[];  // palabras guardadas desde este cuento
}

// Diccionario de logros posibles
const ACHIEVEMENT_DEFS = {
  first_quiz:      { title: 'First Steps',       desc: 'Complete your first quiz',           icon: '🎯' },
  streak_3:        { title: 'Getting Started',    desc: '3-day study streak',                 icon: '🔥' },
  streak_7:        { title: 'Week Warrior',       desc: '7-day study streak',                 icon: '⭐' },
  streak_30:       { title: 'Unstoppable',        desc: '30-day study streak',                icon: '💪' },
  vocab_10:        { title: 'Collector',          desc: 'Save 10 words',                      icon: '📖' },
  vocab_50:        { title: 'Lexicon Builder',    desc: 'Save 50 words',                      icon: '📚' },
  vocab_100:       { title: 'Polyglot in Making', desc: 'Save 100 words',                     icon: '🗣️' },
  perfect_quiz:    { title: 'Perfect Score',      desc: 'Get 100% on any quiz',               icon: '💯' },
  all_levels:      { title: 'Course Complete',    desc: 'Complete all 6 levels',              icon: '🏆' },
  crossword_first: { title: 'Word Detective',     desc: 'Complete your first crossword',      icon: '🔍' },
  reading_5:       { title: 'Bookworm',           desc: 'Read 5 stories',                     icon: '📘' },
  reading_20:      { title: 'Avid Reader',        desc: 'Read 20 stories',                    icon: '📕' },
};
```

### 3.2 Inicialización

```typescript
// db.ts
import Dexie from 'dexie';

export class CourseDB extends Dexie {
  vocabulary!: Dexie.Table<SavedWord, number>;
  progress!: Dexie.Table<LevelProgress, string>;
  sessions!: Dexie.Table<StudySession, number>;
  achievements!: Dexie.Table<Achievement, string>;
  stories!: Dexie.Table<StoryProgress, string>;
  settings!: Dexie.Table<UserSettings, string>;

  constructor() {
    super('EnglishCourseDB');
    this.version(1).stores({
      vocabulary: '++id, word, level, nextReview, tags',
      progress: 'levelId',
      sessions: '++id, date',
      achievements: 'id',
      stories: 'storyId',
      settings: 'id',
    });
  }
}

export const db = new CourseDB();
```

---

## 4. Componentes Interactivos

### 4.1 Diccionario Integrado con API (DictionaryLookup.tsx)

**API:** `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (gratuita, sin API key)

**Comportamiento:**
- Input de búsqueda con autocomplete basado en las palabras guardadas del nivel actual
- Al buscar: fetch a Dictionary API
- Muestra: definiciones, IPA fonética, audio de pronunciación, ejemplos de uso, parte de la oración
- Botón "Save Word" → guarda en IndexedDB con nivel actual
- Botón "Find Image" → búsqueda en Unsplash para asociación visual
- Botón "Download JSON" → descarga los datos de la palabra como JSON

**Respuesta esperada de la API:**
```json
{
  "word": "hello",
  "phonetic": "/həˈloʊ/",
  "phonetics": [
    { "text": "/həˈloʊ/", "audio": "https://..." }
  ],
  "meanings": [
    {
      "partOfSpeech": "interjection",
      "definitions": [
        {
          "definition": "Used as a greeting",
          "example": "Hello, how are you?",
          "synonyms": ["hi", "greetings"]
        }
      ]
    }
  ]
}
```

### 4.2 Constructor de Vocabulario (VocabularyBuilder.tsx)

- Lista todas las palabras guardadas por el usuario
- Filtros por nivel, tags, fecha
- Vista: palabra → definición → ejemplo → imagen (si existe) → audio
- Acciones: editar notas, marcar como aprendida, eliminar
- Exportar todo como JSON descargable (`vocabulary-export-2026-06-15.json`)
- Opción de incluir imágenes en base64 para portabilidad

### 4.3 Lector de Cuentos (ReadingViewer.tsx)

Ver sección [5. Lectura por Niveles](#5-lectura-por-niveles)

### 4.4 Crucigrama (Crossword.tsx)

Ver sección [8. Crucigrama Interactivo](#8-crucigrama-interactivo)

### 4.5 Flashcards con SM-2 (FlashcardDeck.tsx)

Ver sección [9. Flashcards con Repetición Espaciada](#9-flashcards-con-repetición-espaciada)

### 4.6 Ejercicios de Evaluación

Ver sección [7. Evaluaciones y Tipos de Ejercicio](#7-evaluaciones-y-tipos-de-ejercicio)

---

## 5. Lectura por Niveles

### 5.1 Biblioteca de Cuentos

Cada nivel tiene **6-10 cuentos cortos originales** escritos específicamente para ese CEFR:

| Nivel | Palabras por cuento | Estructuras permitidas | Temas |
|---|---|---|---|
| A1 | 50-100 | Present simple, verb to be, there is/are, basic adjectives | Family, daily routine, animals, colors, school |
| A2 | 100-200 | Past simple, present continuous, comparatives, can/can't | Shopping, weather, weekend trips, food |
| B1 | 200-400 | Present perfect, will future, first conditional, modals | Travel, work, technology, health |
| B1+ | 300-500 | Present perfect continuous, second conditional, reported speech | Relationships, city life, traditions, environment |
| B2 | 400-700 | Mixed conditionals, passive all tenses, inversion | Society, ethics, science, art |
| B2+ | 500-1000 | Participle clauses, wish, hedging, discourse markers | Business, politics, philosophy, literature |

### 5.2 Funcionalidades del Lector

```
┌──────────────────────────────────────────┐
│  [← Back]                     A2 · Story 3 │
│                                              │
│  📖 The Lost Kitten                          │
│                                              │
│  Sarah ﹏walked﹏ to the park ﹏yesterday﹏.  │
│  She ﹏found﹏ a small ﹏kitten﹏ under a     │
│  tree. The kitten was ﹏scared﹏ and cold.    │
│  Sarah ﹏took﹏ it home.                      │
│                                              │
│  ┌─────────────────────────────────┐         │
│  │  scared = asustado              │         │
│  │  🔊 Listen                      │         │
│  │  ★ Save to vocabulary           │         │
│  └─────────────────────────────────┘         │
│                                              │
│  [▶ Listen to story]    [Quiz →]             │
└──────────────────────────────────────────┘
```

- **Tap en cualquier palabra** → tooltip con definición (Dictionary API en vivo o cache local)
- **Highlight de vocabulario clave** del nivel (subrayado punteado)
- **Audio** → Web Speech API reads the story sentence by sentence
- **Velocidad de audio** ajustable (0.5x, 0.75x, 1x, 1.25x)
- **Save word** → añade a IndexedDB con el cuento como tag
- **Post-reading quiz** → 5 preguntas de comprensión

### 5.3 Formato de Datos de Cuentos

```json
{
  "id": "a2-story-03",
  "level": "a2",
  "title": "The Lost Kitten",
  "wordCount": 145,
  "vocabulary": ["walked", "found", "kitten", "scared", "took"],
  "text": [
    { "sentence": "Sarah walked to the park yesterday.", 
      "audio": true, 
      "keyVocab": ["walked"] },
    { "sentence": "She found a small kitten under a tree.", 
      "audio": true, 
      "keyVocab": ["found", "kitten"] }
  ],
  "quiz": [
    {
      "type": "multiple-choice",
      "question": "Where did Sarah find the kitten?",
      "options": ["Under a tree", "In a store", "At school", "At home"],
      "correct": 0
    }
  ],
  "discussionPrompt": "Have you ever found a lost animal? What did you do?"
}
```

---

## 6. Sistema de Vocabulario con API

### 6.1 Integraciones API

| API | URL | Uso | Límite |
|---|---|---|---|
| **Free Dictionary API** | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | Definiciones, ejemplos, fonética, audio | Ilimitado (gratuito) |
| **Unsplash API** | `https://api.unsplash.com/search/photos?query={word}&client_id={KEY}` | Imágenes asociativas para palabras | 50 req/hora (free tier) |
| **Web Speech API** | Navegador (SpeechSynthesis + SpeechRecognition) | Pronunciación y reconocimiento de voz | Sin límite |

### 6.2 Flujo de "Aprender una Palabra Nueva"

```
1. Usuario encuentra palabra nueva (lectura, quiz, o búsqueda manual)
2. → Tap → Dictionary API fetch
3. → Muestra: definición, fonética, audio, ejemplo
4. → Unsplash API fetch (opcional): imagen asociativa
5. → Usuario guarda palabra con nivel y tags
6. → Palabra entra al sistema SM-2 para repaso espaciado
7. → Usuario puede descargar JSON con palabra + definición + imagen

Progresión de aprendizaje:
  Día 0:  → Aprende (Save + ver definición)
  Día 1:  → Repaso 1 (Flashcard)
  Día 3:  → Repaso 2 (si acertó)
  Día 7:  → Repaso 3
  Día 16: → Repaso 4
  Día 35: → Repaso 5 → "Dominada" ✔
```

### 6.3 Exportación JSON Descargable

```json
{
  "exportDate": "2026-06-15",
  "level": "a2",
  "words": [
    {
      "word": "kitten",
      "phonetic": "/ˈkɪt.ən/",
      "definition": "A young cat",
      "example": "The kitten played with a ball of yarn.",
      "imageUrl": "data:image/jpeg;base64,...",
      "audioUrl": "https://...",
      "tags": ["animals", "a2"],
      "learnedDate": "2026-06-10"
    }
  ]
}
```

El JSON se genera con las imágenes en base64 para que sea **completamente portátil** — se puede imprimir, compartir, importar en Anki, etc.

---

## 7. Evaluaciones y Tipos de Ejercicio

### 7.1 Taxonomía de Ejercicios

| Tipo | Habilidad | Niveles | Descripción |
|---|---|---|---|
| **Multiple Choice** | Gramática / Vocabulario | Todos | Elegir entre 4 opciones. Feedback inmediato con explicación. |
| **Fill in the Blank** | Gramática / Lectura | Todos | Completar espacios en una oración o párrafo. |
| **Matching (Drag & Drop)** | Vocabulario | A1-B2 | Arrastrar palabras a definiciones, imágenes a palabras, o mitades de oraciones. |
| **Sentence Reorder** | Gramática / Escritura | A2-B2+ | Arrastrar palabras en desorden para formar una oración correcta. |
| **Error Correction** | Gramática | B1-B2+ | Identificar y corregir el error en una oración. |
| **Sentence Transformation** | Gramática | B1-B2+ | Reescribir manteniendo el significado (activa ↔ pasiva, discurso directo ↔ indirecto). |
| **Cloze Passage** | Lectura / Gramática | A2-B2+ | Párrafo completo con múltiples espacios (tipo "examen de Cambridge"). |
| **Listening Comprehension** | Escucha | A1-B2+ | Web Speech API lee un texto, usuario responde preguntas. |
| **Speaking Practice** | Habla | A1-B2+ | SpeechRecognition evalúa pronunciación de palabras/frases. |
| **Writing Prompt** | Escritura | A1-B2+ | Escribir texto libre con contador de palabras y checklist. |
| **Crossword** | Vocabulario | A1-B2+ | Ver sección 8. |
| **Flashcard Review** | Vocabulario | Todos | Ver sección 9. |
| **Dictation** | Escucha/Escritura | A1-B2 | Web Speech API dicta, usuario escribe lo que escucha. |

### 7.2 Sistema de Puntuación

```
Ejercicio completado:            +10 XP base
Respuesta correcta (individual): +5 XP
Racha de respuestas correctas:   +2 XP extra por cada 3 consecutivas
Quiz completo con 100%:          +20 XP bonus
Flashcard respondida correctamente: +3 XP
Palabra nueva guardada:          +5 XP
Cuento leído completo:           +15 XP
Ejercicio de escritura:          +10-30 XP (según longitud)
Racha diaria (día 1):            +5 XP
Racha diaria (día 7):            +20 XP
Racha diaria (día 30):           +100 XP
```

### 7.3 Formato Unificado de Pregunta

```typescript
interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'reorder' 
      | 'error-correction' | 'transformation' | 'cloze' 
      | 'listening' | 'speaking' | 'writing' | 'dictation';
  level: string;
  unit: string;
  difficulty: 1 | 2 | 3;  // dentro del nivel
  prompt: string;
  // type-specific fields
  options?: string[];
  correct?: number | number[] | string;
  blanks?: { position: number; correct: string; options?: string[] }[];
  pairs?: { left: string; right: string }[];
  words?: string[];  // para reorder
  error?: string;    // para error-correction
  explanation: string;
  hint?: string;
  audioText?: string; // para listening/dictation
}
```

---

## 8. Crucigrama Interactivo

### 8.1 Generación

Los crucigramas se definen en archivos JSON por nivel/unidad:

```json
{
  "id": "crossword-a2-01",
  "level": "a2",
  "title": "Past Simple Verbs",
  "instructions": "Complete the crossword with the past simple form of the verbs.",
  "grid": [
    ["W", "E", "N", "T", ""],
    ["", "", "", "", ""],
    ["", "", "A", "", ""],
    ["", "F", "", "", ""],
    ["", "", "", "T", ""]
  ],
  "clues": {
    "across": [
      { "number": 1, "clue": "Go → ___", "answer": "WENT", "start": [0,0] }
    ],
    "down": [
      { "number": 1, "clue": "Eat → ___", "answer": "ATE", "start": [0,4] }
    ]
  },
  "vocabulary": ["went", "ate"]
}
```

### 8.2 Interactividad

- Grid táctil: tap en celda → selecciona dirección (across/down) → teclado virtual
- Validación en tiempo real: letra correcta → verde, incorrecta → rojo suave
- Pista: botón "Hint" → revela una letra aleatoria
- Check: botón "Check" → verifica todo, marca errores
- Timer opcional: modo desafío con cronómetro
- Score: puntos por palabras completadas sin ayuda

### 8.3 Layout

```
┌─────────────────────────────────────┐
│  🧩 Past Simple Verbs — A2         │
│                                     │
│  ┌───┬───┬───┬───┬───┐             │
│  │ W │ E │ N │ T │   │  Across     │
│  ├───┼───┼───┼───┼───┤  1. Go → ___│
│  │   │   │   │   │   │             │
│  ├───┼───┼───┼───┼───┤  Down       │
│  │   │   │ A │   │   │  2. Eat → ___│
│  ├───┼───┼───┼───┼───┤             │
│  │   │ F │   │   │   │             │
│  ├───┼───┼───┼───┼───┤             │
│  │   │   │   │ T │   │             │
│  └───┴───┴───┴───┴───┘             │
│                                     │
│  [1] [2] [3]  [Hint] [Check]       │
│  [4] [5] [6]                       │
│  [7] [8] [9]  ⏱ 02:30              │
│  [0] [←]                           │
└─────────────────────────────────────┘
```

---

## 9. Flashcards con Repetición Espaciada

### 9.1 Algoritmo SM-2 (SuperMemo 2)

```
Parámetros por palabra:
  - easeFactor (EF): default 2.5, mínimo 1.3
  - interval (I): días hasta próximo repaso
  - repetitions (rep): veces seguidas acertando
  - nextReview (next): timestamp del próximo repaso

Al responder:
  Quality (q): 0-5
    q >= 3 → correcta
    q < 3  → incorrecta

  Si q >= 3:
    Si rep == 0: I = 1 día
    Si rep == 1: I = 6 días
    Si rep >= 2: I = I * EF
    rep += 1
  Si q < 3:
    rep = 0
    I = 1 día

  EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  EF = max(EF, 1.3)

  nextReview = now + I días
```

### 9.2 Interfaz

```
┌───────────────────────┐
│   📚 Vocabulary Review │
│                        │
│   Due today: 12 words  │
│   Next review: 8 words │
│                        │
│  ┌───────────────────┐ │
│  │                   │ │
│  │    "kitten"       │ │
│  │                   │ │
│  │   [Show Answer]   │ │
│  │                   │ │
│  └───────────────────┘ │
│                        │
│  How well did you know?│
│  [0]Forgot [1]Hard [3]Good [5]Easy │
│                        │
│  Progress: ▰▰▰▰▰▰▰▰▰▰ 12/20 │
└───────────────────────┘
```

### 9.3 Vistas Adicionales

- **Vista de calendario**: muestra qué días hay repasos programados
- **Estadísticas**: palabras aprendidas, tasa de retención, racha de repasos
- **Filtros**: por nivel, por tag, por dificultad

---

## 10. Centro de Recursos

### 10.1 Canales de YouTube Recomendados (por nivel)

| Canal | Nivel | Enfoque |
|---|---|---|
| **BBC Learning English** | A2-B2 | Noticias, gramática, vocabulario |
| **English Addict (Mr. Duncan)** | A2-B1 | Conversación cotidiana |
| **Rachel's English** | B1-B2 | Pronunciación americana |
| **VOA Learning English** | A2-B1 | Noticias en inglés lento |
| **engVid (Emma, Ronnie, etc.)** | A1-B2 | Lecciones estructuradas |
| **TED-Ed** | B2-B2+ | Charlas educativas con subtítulos |
| **Learn English with TV Series** | B1-B2 | Aprender con series |

### 10.2 Podcasts Recomendados

| Podcast | Nivel | Descripción |
|---|---|---|
| **6 Minute English (BBC)** | B1-B2 | Noticias y cultura en 6 minutos |
| **The English We Speak (BBC)** | B1-B2 | Modismos y expresiones |
| **ESL Pod** | A2-B1 | Diálogos lentos con explicaciones |
| **All Ears English** | B1-B2 | Inglés americano conversacional |
| **Culips ESL Podcast** | A2-B1 | Inglés cotidiano |

### 10.3 Diccionario Integrado

- Página `/dictionary` con buscador completo
- Integra la Free Dictionary API
- Historial de búsquedas (local)
- Botón "Save" para añadir a vocabulario personal
- Filtro por nivel CEFR estimado

### 10.4 Recursos PDF (Descargables)

- **Grammar reference sheets**: resumen visual por nivel
- **Vocabulary lists**: palabras + imágenes + ejemplos
- **Exercise worksheets**: para practicar offline
- **Answer keys**: auto-evaluación

### 10.5 Enlaces Web Útiles

- **Duolingo** — práctica complementaria
- **Quizlet** — flashcards comunitarias
- **Cambridge English** — exámenes de práctica
- **Grammarly** — corrector de escritura

---

## 11. Progreso, Logros y Retos

### 11.1 Dashboard de Progreso

```
┌──────────────────────────────────────────┐
│  🎯 Dashboard                     │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 45%  │  │  🔥  │  │ 450  │          │
│  │Course│  │Day 7 │  │ Total│          │
│  │Done  │  │Streak│  │ XP   │          │
│  └──────┘  └──────┘  └──────┘          │
│                                          │
│  Level Progress:                         │
│  A1 ▰▰▰▰▰▰▰▰▰▰ 100%  ✓                  │
│  A2 ▰▰▰▰▰▰▰░░░  70%                      │
│  B1 ▰▰▰░░░░░░░  30%                      │
│  B1+░░░░░░░░░░   0%                      │
│  B2 ░░░░░░░░░░   0%                      │
│  B2+░░░░░░░░░░   0%                      │
│                                          │
│  Vocabulary: 23 words · 12 due for review│
│  Stories read: 3/24                      │
│  Achievements: 🎯 📖 🔥                  │
│                                          │
│  Today's Challenge: Complete 1 crossword │
│  [+25 XP bonus]                          │
└──────────────────────────────────────────┘
```

### 11.2 Sistema de Logros

Ver `ACHIEVEMENT_DEFS` en sección 3.1 — 14 logros desbloqueables.

### 11.3 Retos Diarios y Semanales

Cada día, el sistema genera un **Daily Challenge**:

| Reto | XP | Descripción |
|---|---|---|
| **Vocab Warmup** | +15 | Review 5 due words |
| **Quick Quiz** | +20 | Complete 5 questions |
| **Crossword** | +25 | Complete 1 crossword |
| **Reading Time** | +20 | Read 1 story |
| **Perfect Round** | +30 | Get 100% on a quiz |
| **Write On** | +25 | Write 50+ words |

Reto semanal (sábado):
- **Weekend Challenge**: combo de 3 ejercicios + lectura + crucigrama + bonus de XP

---

## 12. Exportación de Datos

### 12.1 Formatos de Exportación

| Formato | Contenido | Uso |
|---|---|---|
| **JSON** | Vocabulario completo (palabra, definición, ejemplo, imagen base64, audio URL) | Importar en Anki, compartir, backup |
| **CSV** | Lista plana de palabras | Excel, Google Sheets |
| **PDF** | Páginas con word + image + definition + example (para imprimir) | Estudio offline |
| **HTML** | Flashcards imprimibles | Corte y doblez |

### 12.2 Botones de Exportación

- `/vocabulary` → "Download as JSON" | "Download as CSV"
- `/vocabulary` → "Print Flashcards"
- `/dashboard` → "Download Progress Report (JSON)"

---

## 13. Roadmap de Implementación

### Fase 1 — Fundación (semana 1)
- [ ] IndexedDB con Dexie.js (schema completo)
- [ ] nanostores para estado reactivo
- [ ] Sistema de progreso básico
- [ ] Diccionario integrado con Free Dictionary API
- [ ] Vocabulary Builder con export JSON

### Fase 2 — Flashcards y SM-2 (semana 2)
- [ ] Algoritmo SM-2 implementado
- [ ] FlashcardDeck con 5 niveles de respuesta
- [ ] Vista de calendario de repasos
- [ ] Estadísticas de retención

### Fase 3 — Lectura (semana 2-3)
- [ ] Biblioteca de cuentos (6-10 por nivel)
- [ ] ReadingViewer con tap-to-lookup
- [ ] Web Speech API para audio
- [ ] Comprensión de lectura post-cuento

### Fase 4 — Ejercicios (semana 3-4)
- [ ] Quiz multi-formato (multiple choice, fill blank)
- [ ] Matching Exercise (drag & drop)
- [ ] Sentence Reorder
- [ ] Error Correction
- [ ] Writing Exercise mejorado

### Fase 5 — Crucigrama (semana 4)
- [ ] Grid engine interactivo
- [ ] Diccionario de crucigramas por nivel
- [ ] Teclado virtual + validación
- [ ] Timer + scoring

### Fase 6 — Recursos y API (semana 4-5)
- [ ] Centro de recursos (YouTube, podcasts, PDFs)
- [ ] Unsplash API para imágenes asociativas
- [ ] Speech-to-Text para speaking practice
- [ ] Dictation exercise

### Fase 7 — Gamificación (semana 5)
- [ ] Sistema de logros (14 achievements)
- [ ] Retos diarios y semanales
- [ ] Dashboard completo con estadísticas
- [ ] Streak tracker

### Fase 8 — Pulido (semana 6)
- [ ] Modo offline (Service Worker)
- [ ] Animaciones y micro-interacciones
- [ ] Tests y accesibilidad
- [ ] Deploy a GitHub Pages

---

## 14. Preguntas para Refinar el Plan

Estas son preguntas que me hago para mejorar el prompt y el plan antes de implementar:

### Sobre la Base de Datos
1. **¿Deberíamos usar IndexedDB (cliente) o agregar un backend ligero?** IndexedDB es suficiente para un solo usuario y funciona offline. Pero si queremos sincronización entre dispositivos, necesitaríamos Supabase o similar.
2. **¿El progreso del usuario debe persistir solo localmente o debería tener cuenta con login?** Si es solo local, no hay privacidad ni sincronización. Si hay login, se pierde simplicidad.
3. **¿Qué pasa si el usuario borra el caché del navegador?** Propongo: exportación automática periódica + botón de importar backup.

### Sobre las API
4. **Unsplash API tiene límite de 50 req/hora en el tier gratuito.** ¿Cómo cachear las imágenes para no excederlo? Propongo: guardar URL de Unsplash + descargar y almacenar en IndexedDB como blob.
5. **Free Dictionary API no tiene rate limit documentado, pero podría fallar.** ¿Debemos cachear definiciones localmente? Sí — propongo un cache LRU en IndexedDB.
6. **YouTube Data API requiere API key.** ¿La incluimos en el código del lado del cliente? No es seguro. Alternativa: lista curada estática de canales con enlaces directos (sin API).

### Sobre los Cuentos
7. **¿Generamos los cuentos manualmente (calidad controlada) o usamos IA?** Los cuentos deben ser escritos para garantizar que usen exactamente las estructuras del nivel. Propongo redactarlos manualmente o con asistencia controlada.
8. **¿Cada cuento debe tener audio grabado por humano o Web Speech API es suficiente?** Web Speech API suena robótico. Para A1-A2 puede funcionar; para B1+ quizás necesitemos audio real.

### Sobre los Crucigramas
9. **¿Crucigramas predefinidos o generados por algoritmo?** Predefinidos dan control de calidad y vocabulario exacto. Pero generados por algoritmo permitirían infinitos. Propongo: predefinidos para empezar, generación dinámica como mejora futura.
10. **¿Tamaño máximo del grid?** A1: 6x6, A2: 8x8, B1: 10x10, B2: 12x12.

### Sobre Tipos de Ejercicio
11. **Speaking Practice con Web Speech API — el reconocimiento es inexacto para no-nativos.** ¿Debemos ser flexibles (aproximación fonética) o estrictos? Propongo: modo "practice" (flexible) y modo "challenge" (estricto).
12. **Dictation exercise — ¿Web Speech API puede dictar o necesitamos audio grabado?** Web Speech API puede dictar. La precisión es aceptable.

### Sobre Gamificación
13. **¿Debe haber un sistema de niveles (como videojuego) aparte de los niveles CEFR?** Propongo: XP levels paralelos (Bronze → Silver → Gold → Platinum → Diamond) que desbloquean temas visuales.
14. **¿Los logros deben tener recompensas concretas (temas, badges visuales) o solo notificación?** Badges con SVG único por logro, más bonus de XP.
15. **¿Debe haber un leaderboard?** Solo local (vs ti mismo) para evitar complejidad multiusuario.

### Sobre la Experiencia
16. **¿Cuánto debe durar una sesión de estudio típica?** 10-20 minutos. Las actividades deben diseñarse para completarse en ese tiempo.
17. **¿Debe haber un modo "guía" que recomiende qué hacer cada día?** Sí — un "Daily Plan" generado basado en el progreso y los repasos pendientes.

---

## Resumen de Tecnologías Externas a Integrar

| Recurso | Propósito | Tipo |
|---|---|---|
| Free Dictionary API | Definiciones, ejemplos, audio, fonética | API REST gratuita |
| Unsplash API | Imágenes asociativas para vocabulario | API REST (50 req/h free) |
| Web Speech API (SpeechSynthesis) | Pronunciación y lectura de cuentos | Navegador (nativo) |
| Web Speech API (SpeechRecognition) | Práctica de speaking | Navegador (nativo) |
| Dexie.js | Capa de IndexedDB para persistencia | Librería npm |
| YouTube (enlaces directos) | Recomendaciones de canales | Datos estáticos curados |
| Google Fonts (Sora + Inter) | Tipografía | CDN |

## Conclusión

Este plan cubre:

- ✅ **Fundamento pedagógico**: CLT + TBLT + CEFR alineado
- ✅ **Lectura por niveles**: 6-10 cuentos por nivel con interacción
- ✅ **Crucigrama**: Grid interactivo con teclado virtual y validación
- ✅ **Flashcards**: Con algoritmo SM-2 de repetición espaciada
- ✅ **Evaluaciones múltiples**: 12+ tipos de ejercicio
- ✅ **API Dictionary**: Búsqueda de palabras con definiciones, ejemplos, audio
- ✅ **Exportación JSON**: Vocabulario descargable con imágenes base64
- ✅ **Base de datos**: IndexedDB con Dexie.js para progreso y vocabulario
- ✅ **Centro de recursos**: YouTube, podcasts, PDFs, diccionario integrado
- ✅ **Retos y logros**: Daily challenges, 14 achievements, sistema de XP
- ✅ **Dashboard**: Progreso visual, rachas, estadísticas
