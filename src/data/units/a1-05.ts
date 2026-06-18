import type { UnitData } from "./types";

const unit05: UnitData = {
  id: "a1-05",
  title: "Possessives",
  level: "A1",
  description:
    "Learn to express ownership using possessive adjectives ({my}, {your}, {his}), possessive pronouns ({mine}, {yours}), and the possessive {'s}.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "adjectives-pronouns",
      title: "🏷️ Possessive Adjectives vs Possessive Pronouns",
      paragraphs: [
        "We use possessives to show who owns something. There are two forms: Adjectives (followed by a noun) and Pronouns (used alone, replacing the noun).",
        "",
        "[TABLE]\nSubject Pronoun | Possessive Adjective | Possessive Pronoun | Example (Adj vs Pron)\nI | {my} | {mine} | This is {my} book. / This book is {mine}.\nYou | {your} | {yours} | That is {your} car. / That car is {yours}.\nHe | {his} | {his} | It is {his} dog. / The dog is {his}.\nShe | {her} | {hers} | These are {her} keys. / These keys are {hers}.\nIt | {its} | - | The cat drank {its} milk. / (No pronoun form).\nWe | {our} | {ours} | This is {our} house. / This house is {ours}.\nThey | {their} | {theirs} | Those are {their} bags. / Those bags are {theirs}.",
        "",
        "⚠️ Remember: Possessive adjectives MUST have a noun after them: my + {noun} (my pen). Possessive pronouns NEVER have a noun after them (This pen is mine).",
      ],
    },
    {
      id: "saxon-genitive",
      title: "⛓️ Saxon Possessive — 's",
      paragraphs: [
        "In English, we express possession between people and things using {'s} after the owner. We do NOT use 'of' like in Spanish.",
        "",
        "• {John}'s car. (✗ El carro de John → ✓ John's car).",
        "• My {mother}'s house. (✗ La casa de mi madre → ✓ My mother's house).",
        "",
        "📌 Spelling Rules for Possessive 's:",
        "1. Singular owner: Add {'s} (Anna's dog, the teacher's pen).",
        "2. Plural owner ending in -s: Add ONLY the apostrophe { '} (my parents' house, the girls' school).",
        "3. Plural owner not ending in -s (irregular): Add {'s} (the children's toys, the men's room).",
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Possessive Adjectives",
      instruction: "Choose the correct possessive adjective (my, your, his, her, its, our, their).",
      items: [
        {
          type: "fill-blank",
          prompt: "I live here. This is ___ house.",
          options: ["my", "mine", "me"],
          answer: 0,
          explanation: "'house' is a noun, so we use the possessive adjective 'my'.",
        },
        {
          type: "fill-blank",
          prompt: "Sarah has a new job. ___ job is interesting.",
          options: ["His", "Her", "Hers"],
          answer: 1,
          explanation: "For 'Sarah' (female owner), we use the possessive adjective 'Her'.",
        },
        {
          type: "fill-blank",
          prompt: "They sold ___ car yesterday.",
          options: ["their", "theirs", "them"],
          answer: 0,
          explanation: "'car' is a noun, so we use 'their'.",
        },
        {
          type: "fill-blank",
          prompt: "The dog wagged ___ tail.",
          options: ["it's", "its", "his"],
          answer: 1,
          explanation: "For animals/things, the possessive adjective is 'its' (no apostrophe).",
        },
        {
          type: "fill-blank",
          prompt: "We love ___ teacher.",
          options: ["our", "ours", "us"],
          answer: 0,
          explanation: "The possessive adjective for 'we' is 'our'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Possessive Pronouns",
      instruction: "Select the correct possessive pronoun (mine, yours, his, hers, ours, theirs).",
      items: [
        {
          type: "mcq",
          question: "This pen belongs to me. It is ___.",
          options: ["my", "mine", "myself"],
          answer: 1,
          explanation: "No noun follows, so we use the possessive pronoun 'mine'.",
        },
        {
          type: "mcq",
          question: "Is this book yours or ___?",
          options: ["her", "hers", "she"],
          answer: 1,
          explanation: "No noun follows, so we use the possessive pronoun 'hers'.",
        },
        {
          type: "mcq",
          question: "This classroom belongs to us. It is ___.",
          options: ["our", "ours", "ours'"],
          answer: 1,
          explanation: "We use 'ours' as a possessive pronoun representing 'our classroom'.",
        },
        {
          type: "mcq",
          question: "That house belongs to them. It is ___.",
          options: ["their", "theirs", "their's"],
          answer: 1,
          explanation: "We use 'theirs' as the possessive pronoun for 'they'.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Saxon Genitive ('s)",
      instruction: "Choose the correct possessive 's structure.",
      items: [
        {
          type: "mcq",
          question: "How do you say 'El carro de mi hermano'?",
          options: ["The car of my brother.", "My brother's car.", "My brothers' car."],
          answer: 1,
          explanation: "Singular owner 'brother' + 's → 'My brother's car'.",
        },
        {
          type: "mcq",
          question: "This is my ___ house (belonging to both my parents).",
          options: ["parent's", "parents's", "parents'"],
          answer: 2,
          explanation: "Plural owner ending in -s takes only an apostrophe → 'parents''.",
        },
        {
          type: "mcq",
          question: "Where are the ___ toys?",
          options: ["children's", "childrens'", "childs'"],
          answer: 0,
          explanation: "Irregular plural 'children' takes ''s' → 'children's'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Adjective vs Pronoun",
      instruction: "Select the option that correctly completes the sentence.",
      items: [
        {
          type: "mcq",
          question: "Excuse me, is this ___ coat? No, it isn't ___.",
          options: ["your / my", "your / mine", "yours / mine"],
          answer: 1,
          explanation: "'your' goes before 'coat', 'mine' stands alone.",
        },
        {
          type: "mcq",
          question: "He has a cat. ___ name is Kitty.",
          options: ["His", "Its", "Her"],
          answer: 1,
          explanation: "For the cat's name, we use 'Its'.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Spot common possessive errors.",
      items: [
        {
          type: "error-spot",
          incorrect: "The car of David is red.",
          correct: "David's car is red.",
          explanation: "In English, possession between people and things is expressed using the Saxon genitive 's, not 'of'.",
        },
        {
          type: "error-spot",
          incorrect: "That book is my.",
          correct: "That book is mine.",
          explanation: "'my' must be followed by a noun. Alone, use 'mine'.",
        },
        {
          type: "error-spot",
          incorrect: "The cat licked it's paw.",
          correct: "The cat licked its paw.",
          explanation: "'it's' is a contraction of 'it is'. The possessive adjective is 'its'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Possessives",
    instruction: "Answer all 10 questions to test your understanding of possessives.",
    items: [
      {
        type: "fill-blank",
        prompt: "Is this book ___?",
        options: ["your", "yours", "you"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "This is ___ car.",
        options: ["John's", "Johns'", "John"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "The girls are playing with ___ dolls.",
        options: ["their", "theirs", "them"],
        answer: 0,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "The house of my friends is big.",
          "My friends' house is big.",
          "My friend's house is big (multiple friends).",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "These keys are hers.",
          "These keys are her.",
          "These keys are her's.",
        ],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "We sold ___ house last week.",
        options: ["our", "ours", "us"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "The dog lost ___ toy.",
        options: ["his", "its", "it's"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "This phone is ___.",
        options: ["my", "me", "mine"],
        answer: 2,
      },
      {
        type: "error-spot",
        incorrect: "Where is the room of the children?",
        correct: "Where is the children's room?",
        explanation: "Irregular plurals like 'children' take 's for possessive.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "This is his pen, and that is hers.",
          "This is he pen, and that is she.",
          "This is his pen, and that is her.",
        ],
        answer: 0,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "my",
      translation: "mi / mis",
      definition: "Possessive adjective relating to 'I'. Always followed by a noun.",
      example: "This is my room.",
      partOfSpeech: "determiner / possessive adjective",
    },
    {
      word: "mine",
      translation: "mío / mía / míos / mías",
      definition: "Possessive pronoun relating to 'I'. Stands alone without a noun.",
      example: "The blue pen is mine.",
      partOfSpeech: "pronoun / possessive pronoun",
    },
    {
      word: "your",
      translation: "tu / tus / su / sus (de usted)",
      definition: "Possessive adjective relating to 'you'. Always followed by a noun.",
      example: "Is this your jacket?",
      partOfSpeech: "determiner / possessive adjective",
    },
    {
      word: "yours",
      translation: "tuyo / tuya / suyos / suyas",
      definition: "Possessive pronoun relating to 'you'. Stands alone without a noun.",
      example: "This book is yours.",
      partOfSpeech: "pronoun / possessive pronoun",
    },
    {
      word: "his",
      translation: "su / sus (de él) / suyo",
      definition: "Possessive adjective or pronoun relating to 'he'.",
      example: "His car is red. / The red car is his.",
      partOfSpeech: "adjective / pronoun",
    },
    {
      word: "her",
      translation: "su / sus (de ella)",
      definition: "Possessive adjective relating to 'she'. Always followed by a noun.",
      example: "Her father is a doctor.",
      partOfSpeech: "determiner / possessive adjective",
    },
    {
      word: "hers",
      translation: "suyo / suya (de ella)",
      definition: "Possessive pronoun relating to 'she'. Stands alone without a noun.",
      example: "These keys are hers.",
      partOfSpeech: "pronoun / possessive pronoun",
    },
    {
      word: "its",
      translation: "su / sus (de un animal o cosa)",
      definition: "Possessive adjective relating to 'it'. Always followed by a noun.",
      example: "The dog wagged its tail.",
      partOfSpeech: "determiner / possessive adjective",
    },
    {
      word: "our",
      translation: "nuestro / nuestra / nuestros / nuestras",
      definition: "Possessive adjective relating to 'we'. Always followed by a noun.",
      example: "Our school is near the park.",
      partOfSpeech: "determiner / possessive adjective",
    },
    {
      word: "their",
      translation: "su / sus (de ellos/ellas)",
      definition: "Possessive adjective relating to 'they'. Always followed by a noun.",
      example: "Their house is very big.",
      partOfSpeech: "determiner / possessive adjective",
    },
  ],
};

export default unit05;
