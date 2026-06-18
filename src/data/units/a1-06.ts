import type { UnitData } from "./types";

const unit06: UnitData = {
  id: "a1-06",
  title: "Demonstratives & Object Pronouns",
  level: "A1",
  description:
    "Master demonstrative determiners ({this}, {that}, {these}, {those}) and learn to use object pronouns ({me}, {him}, {them}) correctly in sentences.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "demonstratives",
      title: "👉 Demonstratives — This, That, These, Those",
      paragraphs: [
        "We use demonstratives to point to specific things. They change depending on distance (near or far) and number (singular or plural):",
        "",
        "[TABLE]\nDistance | Singular | Plural | Usage\nNear (Aquí) | {this} (este/esta) | {these} (estos/estas) | For things close to you.\nFar (Allí) | {that} (ese/esa/aquel) | {those} (esos/esas/aquellos) | For things at a distance.",
        "",
        "• singular near: {This} book is good. (The book is in my hand).",
        "• plural near: {These} shoes are comfortable.",
        "• singular far: {That} car is fast. (The car is across the street).",
        "• plural far: {Those} birds are flying high.",
      ],
    },
    {
      id: "object-pronouns",
      title: "👤 Object Pronouns",
      paragraphs: [
        "Object pronouns receive the action of the verb. They are placed AFTER the verb or after a preposition (like to, for, with).",
        "",
        "[TABLE]\nSubject Pronoun | Object Pronoun | Translation | Example Sentence\nI | {me} | me / mí | She loves {me}.\nYou | {you} | te / ti / os | I see {you}.\nHe | {him} | lo / le / él | Call {him} now.\nShe | {her} | la / le / ella | I work with {her}.\nIt | {it} | lo / ello / cosa | I bought {it} yesterday.\nWe | {us} | nos / nosotros | Join {us} for dinner.\nThey | {them} | los / las / ellos | Tell {them} the truth.",
        "",
        "⚠️ Comparison: Subject pronouns go BEFORE the verb (I study). Object pronouns go AFTER the verb (He called me) or after prepositions (They listened to us).",
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: This, That, These, Those",
      instruction: "Choose the correct demonstrative depending on distance and quantity.",
      items: [
        {
          type: "fill-blank",
          prompt: "Look at ___ plane high in the sky.",
          options: ["this", "that", "these"],
          answer: 1,
          explanation: "The plane is singular and far away, so we use 'that'.",
        },
        {
          type: "fill-blank",
          prompt: "I love ___ shoes I am wearing right now.",
          options: ["this", "these", "those"],
          answer: 1,
          explanation: "The shoes are plural and near (wearing them) → 'these'.",
        },
        {
          type: "fill-blank",
          prompt: "___ coffee in my hand is hot.",
          options: ["This", "That", "These"],
          answer: 0,
          explanation: "Coffee is singular and near (in my hand) → 'This'.",
        },
        {
          type: "fill-blank",
          prompt: "Who are ___ people over there by the door?",
          options: ["this", "these", "those"],
          answer: 2,
          explanation: "'people' is plural and far ('over there') → 'those'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Object Pronouns",
      instruction: "Choose the correct object pronoun to complete the sentence.",
      items: [
        {
          type: "mcq",
          question: "I see John. I see ___.",
          options: ["his", "him", "he"],
          answer: 1,
          explanation: "The object pronoun for 'John' (he) is 'him'.",
        },
        {
          type: "mcq",
          question: "Where is my book? I can't find ___.",
          options: ["it", "them", "its"],
          answer: 0,
          explanation: "'book' is singular and neutral, so the object pronoun is 'it'.",
        },
        {
          type: "mcq",
          question: "We are lost. Can you help ___?",
          options: ["us", "our", "them"],
          answer: 0,
          explanation: "The object pronoun for 'we' is 'us'.",
        },
        {
          type: "mcq",
          question: "My parents are here. I will call ___.",
          options: ["them", "their", "they"],
          answer: 0,
          explanation: "The object pronoun for 'parents' (they) is 'them'.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Prepositions and Pronouns",
      instruction: "Choose the correct pronoun that follows the preposition.",
      items: [
        {
          type: "mcq",
          question: "This present is for ___ (Sarah).",
          options: ["she", "her", "hers"],
          answer: 1,
          explanation: "After prepositions ('for'), use the object pronoun 'her'.",
        },
        {
          type: "mcq",
          question: "Come with ___ (my friends and me).",
          options: ["we", "our", "us"],
          answer: 2,
          explanation: "After prepositions ('with'), use 'us'.",
        },
        {
          type: "mcq",
          question: "I want to talk to ___ (David).",
          options: ["he", "him", "his"],
          answer: 1,
          explanation: "After prepositions ('to'), use 'him'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Singular vs Plural Demonstratives",
      instruction: "Select the option that is grammatically correct.",
      items: [
        {
          type: "mcq",
          question: "___ apples are sweet (in my hand).",
          options: ["This", "These", "Those"],
          answer: 1,
          explanation: "Plural and near → 'These'.",
        },
        {
          type: "mcq",
          question: "___ mountains are beautiful (far away).",
          options: ["That", "These", "Those"],
          answer: 2,
          explanation: "Plural and far → 'Those'.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Identify and correct common demonstrative/pronoun errors.",
      items: [
        {
          type: "error-spot",
          incorrect: "Listen to he.",
          correct: "Listen to him.",
          explanation: "Use object pronoun 'him' after preposition 'to'.",
        },
        {
          type: "error-spot",
          incorrect: "This books are interesting.",
          correct: "These books are interesting.",
          explanation: "'books' is plural, so we must use 'these' instead of singular 'this'.",
        },
        {
          type: "error-spot",
          incorrect: "Do you like those dress? (pointing close).",
          correct: "Do you like this dress?",
          explanation: "'dress' is singular, and pointing close uses 'this'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Demonstratives & Object Pronouns",
    instruction: "Answer all 10 questions to test your knowledge.",
    items: [
      {
        type: "fill-blank",
        prompt: "Who are ___ girls standing over there?",
        options: ["these", "those", "this"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Please give the keys to ___.",
        options: ["me", "my", "I"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "___ is my new computer here on the table.",
        options: ["This", "That", "These"],
        answer: 0,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "I want to see she.",
          "I want to see her.",
          "I want to see hers.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "Those shoes is dirty.",
          "These shoes are dirty.",
          "This shoes are dirty.",
        ],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "We want to play. Join ___!",
        options: ["us", "we", "our"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "___ house on the hill is huge.",
        options: ["This", "That", "These"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Can you hear ___?",
        options: ["they", "them", "their"],
        answer: 1,
      },
      {
        type: "error-spot",
        incorrect: "He called she yesterday.",
        correct: "He called her yesterday.",
        explanation: "Use the object pronoun 'her' after the verb 'called'.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "Give that papers to me.",
          "Give these papers to me.",
          "Give this papers to me.",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "this",
      translation: "este / esta",
      definition: "Used to identify a specific person or thing close at hand.",
      example: "This is my pen.",
      partOfSpeech: "pronoun / determiner",
    },
    {
      word: "that",
      translation: "ese / esa / aquel / aquella",
      definition: "Used to identify a specific person or thing at a distance.",
      example: "That car is fast.",
      partOfSpeech: "pronoun / determiner",
    },
    {
      word: "these",
      translation: "estos / estas",
      definition: "Plural form of this; points to multiple things close at hand.",
      example: "These shoes are new.",
      partOfSpeech: "pronoun / determiner",
    },
    {
      word: "those",
      translation: "esos / esas / aquellos / aquellas",
      definition: "Plural form of that; points to multiple things at a distance.",
      example: "Those stars are beautiful.",
      partOfSpeech: "pronoun / determiner",
    },
    {
      word: "me",
      translation: "me / mí",
      definition: "Object pronoun corresponding to 'I'.",
      example: "She called me yesterday.",
      partOfSpeech: "pronoun (object)",
    },
    {
      word: "him",
      translation: "lo / le / él",
      definition: "Object pronoun corresponding to 'he'.",
      example: "I will call him later.",
      partOfSpeech: "pronoun (object)",
    },
    {
      word: "her",
      translation: "la / le / ella",
      definition: "Object pronoun corresponding to 'she'.",
      example: "Give her the book.",
      partOfSpeech: "pronoun (object)",
    },
    {
      word: "it",
      translation: "lo / ello / cosa",
      definition: "Object pronoun corresponding to 'it' (things/animals).",
      example: "I found it on the floor.",
      partOfSpeech: "pronoun (object)",
    },
    {
      word: "us",
      translation: "nos / nosotros / nosotras",
      definition: "Object pronoun corresponding to 'we'.",
      example: "Join us for dinner.",
      partOfSpeech: "pronoun (object)",
    },
    {
      word: "them",
      translation: "los / las / ellos / ellas",
      definition: "Object pronoun corresponding to 'they'.",
      example: "Tell them to wait.",
      partOfSpeech: "pronoun (object)",
    },
  ],
};

export default unit06;
