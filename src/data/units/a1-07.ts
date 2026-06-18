import type { UnitData } from "./types";

const unit07: UnitData = {
  id: "a1-07",
  title: "There is & There are",
  level: "A1",
  description:
    "Learn to describe rooms, cities, and objects using {there is} (singular) and {there are} (plural), and master place prepositions like {in}, {on}, and {under}.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "there-is-are",
      title: "🏢 Affirmative, Negative & Questions",
      paragraphs: [
        "We use {there is} (singular) and {there are} (plural) to state that something exists. They translate to 'hay' in Spanish.",
        "",
        "[TABLE]\nStructure | Singular (Countable) | Plural | Usage\nAffirmative | {there is} a book | {there are} books | Declarative existence.\nNegative | {there is} not a book | {there are} not books | Contractions: there isn't / there aren't.\nQuestion | {is there} a book? | {are there} books? | Auxiliary goes before 'there'.\nShort Answer | Yes, there is. / No, there isn't. | Yes, there are. / No, there aren't. | Do not repeat the noun.",
        "",
        "• singular: {There is} a computer on my desk.",
        "• plural: {There are} three chairs in the dining room.",
        "• negative: There isn't {a} television in the bedroom.",
        "• negative plural: There aren't {any} books on the shelf. *(We use 'any' in plural negatives)*",
      ],
    },
    {
      id: "prepositions",
      title: "📍 Prepositions of Place",
      paragraphs: [
        "Prepositions of place show where an object is located relative to another:",
        "",
        "• {in} (dentro de): The keys are {in} my pocket / the drawer.",
        "• {on} (sobre / encima de - con contacto superficial): The computer is {on} the desk.",
        "• {under} (debajo de): The cat is sleeping {under} the bed.",
        "• {next to} (al lado de): The pharmacy is {next to} the supermarket.",
        "• {behind} (detrás de): The garden is {behind} the house.",
        "• {in front of} (delante de): There is a tree {in front of} my window.",
        "• {between} (entre dos cosas): The table is {between} the two sofas.",
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: There is vs There are",
      instruction: "Choose 'there is' or 'there are' to complete the sentence.",
      items: [
        {
          type: "fill-blank",
          prompt: "___ a beautiful park in my town.",
          options: ["There is", "There are", "Is there"],
          answer: 0,
          explanation: "The noun is singular ('a park') → 'There is'.",
        },
        {
          type: "fill-blank",
          prompt: "___ five students in the library.",
          options: ["There is", "There are", "Are there"],
          answer: 1,
          explanation: "The noun is plural ('five students') → 'There are'.",
        },
        {
          type: "fill-blank",
          prompt: "___ any milk in the fridge?",
          options: ["There is", "Is there", "Are there"],
          answer: 1,
          explanation: "This is a question with a singular/uncountable noun ('milk') → 'Is there'.",
        },
        {
          type: "fill-blank",
          prompt: "___ any cars in the garage.",
          options: ["There isn't", "There aren't", "There are"],
          answer: 1,
          explanation: "The sentence is negative and plural ('cars') → 'There aren't'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Prepositions of Place",
      instruction: "Choose the correct preposition of place (in, on, under, next to).",
      items: [
        {
          type: "mcq",
          question: "The book is ___ the table (resting on the surface).",
          options: ["in", "on", "under"],
          answer: 1,
          explanation: "We use 'on' for contact with a surface.",
        },
        {
          type: "mcq",
          question: "The cat is hiding ___ the bed (beneath it).",
          options: ["in", "on", "under"],
          answer: 2,
          explanation: "We use 'under' to mean beneath something.",
        },
        {
          type: "mcq",
          question: "My laptop is ___ my bag.",
          options: ["in", "on", "next to"],
          answer: 0,
          explanation: "We use 'in' to show something is inside a container or space.",
        },
        {
          type: "mcq",
          question: "The television is ___ the window.",
          options: ["next to", "in", "between"],
          answer: 0,
          explanation: "'next to' shows adjacent positioning.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Negative forms",
      instruction: "Convert sentences into their correct negative forms.",
      items: [
        {
          type: "mcq",
          question: 'Negative of: "There is a table in the room."',
          options: ["There aren't a table in the room.", "There isn't a table in the room.", "There is no a table in the room."],
          answer: 1,
          explanation: "Singular negative is 'There isn't a...'.",
        },
        {
          type: "mcq",
          question: 'Negative of: "There are some pictures on the wall."',
          options: ["There aren't any pictures on the wall.", "There isn't any pictures on the wall.", "There aren't some pictures on the wall."],
          answer: 0,
          explanation: "Plural negative replaces 'some' with 'any' → 'There aren't any pictures...'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Question Order",
      instruction: "Arrange the words to form correct questions.",
      items: [
        {
          type: "word-order",
          jumbled: ["a", "supermarket", "there", "is", "here", "near"],
          correct: ["Is", "there", "a", "supermarket", "near", "here?"],
          explanation: "Question starts with auxiliary: Is + there + subject + location context.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Spot common errors in existence expressions or prepositions.",
      items: [
        {
          type: "error-spot",
          incorrect: "There are a computer in my bedroom.",
          correct: "There is a computer in my bedroom.",
          explanation: "'a computer' is singular, so it must take 'There is'.",
        },
        {
          type: "error-spot",
          incorrect: "The keys are on the drawer.",
          correct: "The keys are in the drawer.",
          explanation: "Keys are inside the drawer, so use preposition 'in' instead of surface 'on'.",
        },
        {
          type: "error-spot",
          incorrect: "There have many parks in this city.",
          correct: "There are many parks in this city.",
          explanation: "In English, we express existence ('hay') with 'there is/are', never with 'there have' or 'have'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — There is & There are",
    instruction: "Answer all 10 questions to test your proficiency.",
    items: [
      {
        type: "fill-blank",
        prompt: "___ many pictures on the wall.",
        options: ["There is", "There are", "There aren't"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Is there ___ window in the room?",
        options: ["a", "any", "some"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "No, there ___.",
        options: ["isn't", "aren't", "is"],
        answer: 0,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "There aren't some books here.",
          "There aren't any books here.",
          "There aren't no books here.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "The cat is between the sofa.",
          "The cat is next to the sofa.",
          "The cat is on front of the sofa.",
        ],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "___ any banks near here?",
        options: ["Is there", "Are there", "There are"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "The keys are ___ the table.",
        options: ["in", "on", "under"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "The park is ___ the school.",
        options: ["between", "next to", "in"],
        answer: 1,
      },
      {
        type: "error-spot",
        incorrect: "Are there a library near here?",
        correct: "Is there a library near here?",
        explanation: "'a library' is singular; use 'Is there'.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "There have two chairs in the kitchen.",
          "There are two chairs in the kitchen.",
          "There is two chairs in the kitchen.",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "there is",
      translation: "hay (singular)",
      definition: "Used to state the existence of a singular noun.",
      example: "There is a map on the wall.",
      partOfSpeech: "phrase",
    },
    {
      word: "there are",
      translation: "hay (plural)",
      definition: "Used to state the existence of multiple plural nouns.",
      example: "There are many trees in the garden.",
      partOfSpeech: "phrase",
    },
    {
      word: "in",
      translation: "en / dentro de",
      definition: "Preposition indicating container, enclosed space, or boundary.",
      example: "The key is in the lock.",
      partOfSpeech: "preposition",
    },
    {
      word: "on",
      translation: "en / sobre / encima de",
      definition: "Preposition indicating contact with a surface.",
      example: "The book is on the table.",
      partOfSpeech: "preposition",
    },
    {
      word: "under",
      translation: "debajo de",
      definition: "Preposition indicating a position directly below something.",
      example: "The dog is under the desk.",
      partOfSpeech: "preposition",
    },
    {
      word: "next to",
      translation: "al lado de",
      definition: "Preposition indicating a position adjacent to something.",
      example: "The pharmacy is next to the bank.",
      partOfSpeech: "preposition",
    },
    {
      word: "behind",
      translation: "detrás de",
      definition: "Preposition indicating a position at the back of something.",
      example: "The sun disappeared behind the clouds.",
      partOfSpeech: "preposition",
    },
    {
      word: "in front of",
      translation: "delante de",
      definition: "Preposition indicating a position facing the front of something.",
      example: "The car is parked in front of the house.",
      partOfSpeech: "preposition",
    },
    {
      word: "between",
      translation: "entre (dos cosas)",
      definition: "Preposition indicating a position in the middle of two points.",
      example: "The town lies between two mountains.",
      partOfSpeech: "preposition",
    },
    {
      word: "bedroom",
      translation: "dormitorio / habitación",
      definition: "A room used for sleeping.",
      example: "There is a bed in my bedroom.",
      partOfSpeech: "noun",
    },
  ],
};

export default unit07;
