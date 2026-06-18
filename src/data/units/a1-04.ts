import type { UnitData } from "./types";

const unit04: UnitData = {
  id: "a1-04",
  title: "Regular & Irregular Plurals",
  level: "A1",
  description:
    "Learn the spelling rules for regular plurals and memorize key irregular plural forms like {people}, {men}, and {children}.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "regular-rules",
      title: "✍️ Regular Plurals Spelling Rules",
      paragraphs: [
        "In English, we usually make a noun plural by adding {-s} to the singular form. However, there are spelling rules depending on how the word ends:",
        "",
        "[TABLE]\nEnding | Plural Ending | Examples | Explanation\nMost nouns | Add -s | {book} → {books}\n{car} → {cars} | Add -s directly.\n-s, -ss, -sh, -ch, -x, -z | Add -es | {bus} → {buses}\n{box} → {boxes} | For easier pronunciation.\nConsonant + y | -y → -ies | {baby} → {babies}\n{city} → {cities} | Drop the 'y' first.\nVowel (a, e, i, o, u) + y | Add -s | {boy} → {boys}\n{key} → {keys} | Do NOT change the 'y'.\n-f or -fe | -f/-fe → -ves | {wife} → {wives}\n{leaf} → {leaves} | F changes to V sound.",
      ],
    },
    {
      id: "irregular-plurals",
      title: "👥 Irregular Plural Nouns",
      paragraphs: [
        "Some nouns do not follow standard spelling rules when they become plural. You must memorize these common forms:",
        "",
        "• singular: {man} → plural: {men}",
        "• singular: {woman} → plural: {women} *(Pronounced /ˈwɪmɪn/)*",
        "• singular: {child} → plural: {children}",
        "• singular: {person} → plural: {people}",
        "• singular: {foot} → plural: {feet}",
        "• singular: {tooth} → plural: {teeth}",
        "• singular: {mouse} → plural: {mice}",
        "• singular: {fish} → plural: {fish} *(Spelling does not change)*",
        "• singular: {sheep} → plural: {sheep} *(Spelling does not change)*",
        "",
        "⚠️ Warning: Never say ✗ peoples or ✗ childrens. These are already plural!",
        "  ✓ The {children} are playing.   ✗ The childrens are playing.",
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Regular Plural Spelling",
      instruction: "Choose the correct spelling of the plural form.",
      items: [
        {
          type: "fill-blank",
          prompt: "There are many ___ in this city.",
          options: ["bus", "buses", "buss"],
          answer: 1,
          explanation: "Nouns ending in '-s' add '-es' → 'buses'.",
        },
        {
          type: "fill-blank",
          prompt: "The baby has two ___.",
          options: ["tooths", "teeth", "teeths"],
          answer: 1,
          explanation: "'tooth' is irregular and becomes 'teeth'.",
        },
        {
          type: "fill-blank",
          prompt: "I bought three ___.",
          options: ["box", "boxs", "boxes"],
          answer: 2,
          explanation: "Nouns ending in '-x' add '-es' → 'boxes'.",
        },
        {
          type: "fill-blank",
          prompt: "We visited two historic ___.",
          options: ["citys", "cities", "cityes"],
          answer: 1,
          explanation: "Consonant + 'y' changes 'y' to 'ies' → 'cities'.",
        },
        {
          type: "fill-blank",
          prompt: "Are these your ___?",
          options: ["keys", "keies", "keyes"],
          answer: 0,
          explanation: "Vowel + 'y' just adds '-s' → 'keys'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Irregular Plurals",
      instruction: "Select the correct irregular plural noun.",
      items: [
        {
          type: "mcq",
          question: "Three ___ are walking down the street.",
          options: ["mans", "men", "mens"],
          answer: 1,
          explanation: "The plural of 'man' is 'men'.",
        },
        {
          type: "mcq",
          question: "There are ten ___ in the classroom.",
          options: ["childs", "childrens", "children"],
          answer: 2,
          explanation: "The plural of 'child' is 'children' (no 's').",
        },
        {
          type: "mcq",
          question: "How many ___ live in this country?",
          options: ["people", "peoples", "persons"],
          answer: 0,
          explanation: "'people' is the plural form of 'person' (general).",
        },
        {
          type: "mcq",
          question: "My ___ are cold.",
          options: ["foots", "feets", "feet"],
          answer: 2,
          explanation: "The plural of 'foot' is 'feet'.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: F to VES changes",
      instruction: "Identify correct pluralization of nouns ending in -f or -fe.",
      items: [
        {
          type: "mcq",
          question: "The autumn winds blow the ___ off the trees.",
          options: ["leafs", "leaves", "leavs"],
          answer: 1,
          explanation: "'leaf' ends in '-f', which changes to '-ves' → 'leaves'.",
        },
        {
          type: "mcq",
          question: "They are holding sharp ___.",
          options: ["knifes", "knivees", "knives"],
          answer: 2,
          explanation: "'knife' ends in '-fe', changing to '-ves' → 'knives'.",
        },
        {
          type: "mcq",
          question: "We bought three ___ of bread.",
          options: ["loaves", "loafs", "loavs"],
          answer: 0,
          explanation: "'loaf' ends in '-f', changing to '-ves' → 'loaves'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Unchanging Plurals",
      instruction: "Choose the correct unchanging plural syntax.",
      items: [
        {
          type: "mcq",
          question: "I see a flock of twenty ___ in the field.",
          options: ["sheeps", "sheep", "sheepes"],
          answer: 1,
          explanation: "'sheep' does not change in the plural form.",
        },
        {
          type: "mcq",
          question: "There are many ___ swimming in the river.",
          options: ["fish", "fishes", "fishs"],
          answer: 0,
          explanation: "'fish' is the standard plural form (when referring to the same species).",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Spot common regular and irregular plural errors.",
      items: [
        {
          type: "error-spot",
          incorrect: "The childrens are playing in the park.",
          correct: "The children are playing in the park.",
          explanation: "'children' is already plural; do not add 's'.",
        },
        {
          type: "error-spot",
          incorrect: "Three womans are waiting outside.",
          correct: "Three women are waiting outside.",
          explanation: "The plural of 'woman' is 'women'.",
        },
        {
          type: "error-spot",
          incorrect: "Put the boxs on the table.",
          correct: "Put the boxes on the table.",
          explanation: "Verbs/nouns ending in -x require '-es' to pluralize → 'boxes'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Plural Nouns",
    instruction: "Answer all 10 questions to test your understanding of plurals.",
    items: [
      {
        type: "fill-blank",
        prompt: "The cat chased three ___.",
        options: ["mouses", "mice", "mices"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Brush your ___ twice a day.",
        options: ["tooths", "teeth", "teeths"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "He has three ___.",
        options: ["childs", "childrens", "children"],
        answer: 2,
      },
      {
        type: "mcq",
        question: "Which plural form is correct?",
        options: [
          "My family owns two doges.",
          "My family owns two dogs.",
          "My family owns two dog.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which spelling is correct?",
        options: [
          "The countrys have borders.",
          "The countries have borders.",
          "The countryes have borders.",
        ],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "The trees have green ___.",
        options: ["leafs", "leaves", "leavs"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Two ___ are waiting for the doctor.",
        options: ["womans", "women", "womenes"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "These ___ are too small for my feet.",
        options: ["shoe", "shoes", "shoees"],
        answer: 1,
      },
      {
        type: "error-spot",
        incorrect: "Many peoples are on the bus.",
        correct: "Many people are on the bus.",
        explanation: "'people' is the plural form of person; 'peoples' refers to distinct ethnic groups.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "The knife are on the table.",
          "The knives is on the table.",
          "The knives are on the table.",
        ],
        answer: 2,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "child",
      translation: "niño / niña",
      definition: "A young human being below the age of puberty.",
      example: "She is a happy child. / They have three children.",
      partOfSpeech: "noun",
    },
    {
      word: "people",
      translation: "gente / personas",
      definition: "Human beings in general or considered collectively.",
      example: "There are many people at the concert.",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "woman",
      translation: "mujer",
      definition: "An adult female human being.",
      example: "She is a strong woman. / Three women are in the office.",
      partOfSpeech: "noun",
    },
    {
      word: "man",
      translation: "hombre",
      definition: "An adult male human being.",
      example: "He is a tall man. / Two men are playing chess.",
      partOfSpeech: "noun",
    },
    {
      word: "cities",
      translation: "ciudades",
      definition: "Plural form of city; large or important towns.",
      example: "London and Paris are big cities.",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "leaves",
      translation: "hojas (árbol)",
      definition: "Plural form of leaf; green parts of a plant or tree.",
      example: "The leaves fall in autumn.",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "keys",
      translation: "llaves",
      definition: "Plural form of key; small metal instruments used to open locks.",
      example: "Where are my keys?",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "boxes",
      translation: "cajas",
      definition: "Plural form of box; containers with flat bases and sides.",
      example: "Put the boxes in the garage.",
      partOfSpeech: "noun (plural)",
    },
    {
      word: "sheep",
      translation: "oveja / ovejas",
      definition: "Domesticated ruminant mammals kept for wool or meat.",
      example: "I see a white sheep. / Ten sheep are on the hill.",
      partOfSpeech: "noun",
    },
    {
      word: "fish",
      translation: "pez / peces / pescado",
      definition: "Limbless cold-blooded vertebrate animals with gills and fins living in water.",
      example: "The fish are swimming in the aquarium.",
      partOfSpeech: "noun",
    },
  ],
};

export default unit04;
