import type { UnitData } from "./types";

const unit03: UnitData = {
  id: "a1-03",
  title: "Articles & Nouns",
  level: "A1",
  description:
    "Master the rules for using indefinite articles {a} and {an}, the definite article {the}, and singular/plural noun structures.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "a-an",
      title: "🅰️ Indefinite Articles — A vs An",
      paragraphs: [
        "We use {a} or {an} with singular countable nouns when we mention them for the first time or talk about them in general. They mean 'un' or 'una' in Spanish.",
        "",
        "The rule depends on the SOUND of the next word, not the spelling:",
        "• Use {a} before consonant sounds:",
        "  • a {book} / a {car} / a {cat} / a {house}",
        "• Use {an} before vowel sounds (a, e, i, o, u):",
        "  • an {apple} / an {orange} / an {elephant} / an {umbrella}",
        "",
        "⚠️ Important exceptions based on sound:",
        "• Silent 'h': Use {an} because 'h' is silent (an {hour} → /aʊər/ starts with vowel sound).",
        "• Word starts with sound /juː/ (y-sound): Use {a} (a {university} / a {European} country).",
      ],
    },
    {
      id: "the",
      title: "🌍 Definite Article — The",
      paragraphs: [
        "We use {the} when the listener knows exactly which thing we are talking about (specific context or mentioned before). It means 'el, la, los, las' in Spanish.",
        "",
        "[TABLE]\nUsage | Example Sentence | Explanation\nFirst mention | I bought {a} book. | It is any book (general).\nSecond mention | {The} book is interesting. | We know which book (specific).\nUnique things | {The} sun is shining. | Only one Sun exists.\nPlaces in town | She is at {the} bank. | A specific bank we visit.",
        "",
        "⚠️ Note: We do NOT use {a} or {an} with plural nouns (✗ a books → ✓ books). But you CAN use {the} with plural nouns if they are specific (✓ the books on my desk).",
      ],
    },
    {
      id: "zero-article",
      title: "🚫 Zero Article (No Article)",
      paragraphs: [
        "In English, we do NOT use an article in several situations where Spanish does:",
        "1. General plurals: {Dogs} are friendly. (✗ Los perros son amigables → ✓ Dogs are friendly).",
        "2. Countries and cities: She lives in {Spain} / Paris. (Exceptions: countries with 'Republic', 'Kingdom', 'States' like the USA, the UK).",
        "3. Meals, sports, and school subjects: I have {breakfast} at 8:00. / I play {soccer}. / I study {English}.",
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: A vs An",
      instruction: "Choose the correct article (a or an) for the singular noun.",
      items: [
        {
          type: "fill-blank",
          prompt: "I want to eat ___ apple.",
          options: ["a", "an", "the"],
          answer: 1,
          explanation: "'apple' starts with a vowel sound, so we use 'an'.",
        },
        {
          type: "fill-blank",
          prompt: "She is studying at ___ university.",
          options: ["a", "an", "the"],
          answer: 0,
          explanation: "'university' starts with a /juː/ consonant sound, so we use 'a'.",
        },
        {
          type: "fill-blank",
          prompt: "We have ___ hour left.",
          options: ["a", "an", "the"],
          answer: 1,
          explanation: "'hour' has a silent 'h', so it starts with a vowel sound → 'an'.",
        },
        {
          type: "fill-blank",
          prompt: "He drives ___ blue car.",
          options: ["a", "an", "the"],
          answer: 0,
          explanation: "'blue' starts with a consonant sound, so we use 'a'.",
        },
        {
          type: "fill-blank",
          prompt: "There is ___ cat on the table.",
          options: ["a", "an", "the"],
          answer: 0,
          explanation: "'cat' starts with a consonant sound → 'a'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Definite vs Indefinite",
      instruction: "Choose the correct article depending on general or specific context.",
      items: [
        {
          type: "mcq",
          question: "I saw ___ dog yesterday. ___ dog was black.",
          options: ["a / The", "an / The", "the / A"],
          answer: 0,
          explanation: "First mention is general ('a dog'), second mention is specific ('The dog').",
        },
        {
          type: "mcq",
          question: "___ sun is very hot today.",
          options: ["A", "An", "The"],
          answer: 2,
          explanation: "There is only one sun, so we use the definite article 'The'.",
        },
        {
          type: "mcq",
          question: "She is ___ engineer.",
          options: ["a", "an", "the"],
          answer: 1,
          explanation: "Use 'an' before professions starting with a vowel sound.",
        },
        {
          type: "mcq",
          question: "I need to go to ___ dentist.",
          options: ["a", "an", "the"],
          answer: 2,
          explanation: "We use 'the' for specific town services (the dentist, the bank).",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: General Plurals",
      instruction: "Choose the correct sentence form for generalizations.",
      items: [
        {
          type: "mcq",
          question: "How do you translate 'Los gatos son lindos' in general?",
          options: ["The cats are cute.", "Cats are cute.", "A cat is cute."],
          answer: 1,
          explanation: "For general statements about plural nouns, do not use an article.",
        },
        {
          type: "mcq",
          question: "___ water is essential for life.",
          options: ["The", "A", "No article"],
          answer: 2,
          explanation: "Uncountable nouns in general statements do not take an article.",
        },
        {
          type: "mcq",
          question: "___ United States is a big country.",
          options: ["The", "A", "No article"],
          answer: 0,
          explanation: "Countries with plural names or 'States/Kingdom' take 'The'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Daily Routines & School",
      instruction: "Select the option that uses correct article syntax.",
      items: [
        {
          type: "mcq",
          question: "I study ___ history at school.",
          options: ["a", "the", "no article"],
          answer: 2,
          explanation: "School subjects do not take articles.",
        },
        {
          type: "mcq",
          question: "Do you play ___ soccer?",
          options: ["a", "the", "no article"],
          answer: 2,
          explanation: "Sports do not take articles in English.",
        },
        {
          type: "mcq",
          question: "We have ___ lunch at 1:00 PM.",
          options: ["a", "the", "no article"],
          answer: 2,
          explanation: "Meals (breakfast, lunch, dinner) do not take articles.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Spot the errors in article usage.",
      items: [
        {
          type: "error-spot",
          incorrect: "She lives in the France.",
          correct: "She lives in France.",
          explanation: "Most countries do not take the definite article 'the'.",
        },
        {
          type: "error-spot",
          incorrect: "I have an university class.",
          correct: "I have a university class.",
          explanation: "'university' starts with a consonant y-sound, so it takes 'a'.",
        },
        {
          type: "error-spot",
          incorrect: "I saw a elephants at the zoo.",
          options: [],
          correct: "I saw elephants at the zoo.",
          explanation: "Do not use 'a/an' with plural nouns.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Articles & Nouns",
    instruction: "Answer all 10 questions to test your mastery of articles.",
    items: [
      {
        type: "fill-blank",
        prompt: "Can you pass me ___ salt, please?",
        options: ["a", "an", "the"],
        answer: 2,
      },
      {
        type: "fill-blank",
        prompt: "He is ___ honest man.",
        options: ["a", "an", "the"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "I love ___ animals.",
        options: ["the", "a", "no article"],
        answer: 2,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "He plays the basketball.",
          "He plays basketball.",
          "He plays a basketball.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "I live in the London.",
          "I live in London.",
          "I live in a London.",
        ],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "___ moon looks beautiful tonight.",
        options: ["A", "An", "The"],
        answer: 2,
      },
      {
        type: "fill-blank",
        prompt: "I need ___ new book.",
        options: ["a", "an", "the"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "We have class in ___ Room 5.",
        options: ["the", "a", "no article"],
        answer: 2,
      },
      {
        type: "error-spot",
        incorrect: "She has an red hair.",
        correct: "She has red hair.",
        explanation: "'hair' is uncountable and 'red' starts with a consonant, plus it is general.",
      },
      {
        type: "mcq",
        question: "Choose the correct translation: 'El desayuno está listo.'",
        options: [
          "The breakfast is ready.",
          "Breakfast is ready.",
          "A breakfast is ready.",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "book",
      translation: "libro",
      definition: "A written work that is published in printed or digital form.",
      example: "I read a book every month.",
      partOfSpeech: "noun",
    },
    {
      word: "car",
      translation: "carro / coche",
      definition: "A road vehicle with four wheels and an engine.",
      example: "He drives a blue car.",
      partOfSpeech: "noun",
    },
    {
      word: "apple",
      translation: "manzana",
      definition: "A round fruit with red, green, or yellow skin and crisp white flesh.",
      example: "I eat an apple every day.",
      partOfSpeech: "noun",
    },
    {
      word: "hour",
      translation: "hora",
      definition: "A period of time equal to 60 minutes.",
      example: "We have an hour before the meeting.",
      partOfSpeech: "noun",
    },
    {
      word: "university",
      translation: "universidad",
      definition: "A high-level educational institution for study or research.",
      example: "She goes to a famous university.",
      partOfSpeech: "noun",
    },
    {
      word: "sun",
      translation: "sol",
      definition: "The star around which the Earth orbits, providing light and heat.",
      example: "The sun is shining today.",
      partOfSpeech: "noun",
    },
    {
      word: "breakfast",
      translation: "desayuno",
      definition: "The first meal of the day, eaten in the morning.",
      example: "I eat breakfast at 8:00 AM.",
      partOfSpeech: "noun",
    },
    {
      word: "soccer",
      translation: "fútbol",
      definition: "A game played by two teams of eleven players with a round ball.",
      example: "We play soccer on Sundays.",
      partOfSpeech: "noun",
    },
    {
      word: "dogs",
      translation: "perros",
      definition: "Common domestic carnivorous mammals, kept as pets or working animals.",
      example: "Dogs are very friendly.",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "bank",
      translation: "banco (institución)",
      definition: "A financial institution where people deposit and borrow money.",
      example: "I need to withdraw cash from the bank.",
      partOfSpeech: "noun",
    },
  ],
};

export default unit03;
