import type { UnitData } from "./types";

const unit11: UnitData = {
  id: "a1-11",
  title: "Word Order (SVO)",
  level: "A1",
  description:
    "Master the essential structure of English sentences: Subject + Verb + Object, the correct placement of adjectives, and how to build questions.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "svo-structure",
      title: "🏗️ Declarative Sentences: Subject-Verb-Object (SVO)",
      paragraphs: [
        "Unlike Spanish, which has a very flexible word order, English sentences follow a strict structure: **Subject + Verb + Object (SVO)**. You must always include a subject in English sentences.",
        "",
        "• **Subject** (Sujeto): Who or what performs the action. ({I}, {she}, {the dog}).",
        "• **Verb** (Verbo): The action. ({like}, {speaks}, {chases}).",
        "• **Object** (Objeto): Who or what receives the action. ({apples}, {English}, {the cat}).",
        "",
        "[TABLE]\nSubject (S) | Verb (V) | Object (O) | Complement (Time/Place)\n{I} | {like} | {coffee} | every morning.\n{She} | {speaks} | {English} | at work.\n{They} | {bought} | {a new house} | last week.",
        "",
        "**Common mistake:** Omitting the subject. In Spanish we say 'Llueve' (sujeto tácito), but in English you MUST say: '{It rains}'. Or 'Es fácil' → '{It is easy}'."
      ],
    },
    {
      id: "adjective-placement",
      title: "🎨 Adjective Placement",
      paragraphs: [
        "In Spanish, adjectives usually go *after* the noun (el coche azul). In English, adjectives almost always go **before the noun**:",
        "",
        "• Structure: **Adjective + Noun**.",
        "  - {a blue car} (un coche azul) - Not: a car blue.",
        "  - {an interesting book} (un libro interesante).",
        "  - {hot water} (agua caliente).",
        "",
        "• Adjectives are **never pluralized**: {red apples} (manzanas rojas) - Not: reds apples.",
        "• Adjectives can also go after the verb **'to be'**: The house is {big}."
      ],
    },
    {
      id: "questions-structure",
      title: "❓ Question Structure (ASV / QASV)",
      paragraphs: [
        "In English, we do not just put question marks at the beginning and end of a sentence. We must change the word order and use an auxiliary verb (do, does, is, are, can).",
        "",
        "**1. Yes/No Questions (ASV - Auxiliary + Subject + Verb):**",
        "• **{Do}** {you} {like} tea? *(Auxiliary: Do | Subject: you | Verb: like)*",
        "• **{Is}** {he} a teacher? *(Auxiliary: Is | Subject: he | Complement: a teacher)*",
        "• **{Can}** {she} swim? *(Auxiliary: Can | Subject: she | Verb: swim)*",
        "",
        "**2. Wh- Questions (QASV - Question Word + Auxiliary + Subject + Verb):**",
        "• **{Where}** **{do}** {you} {live}? *(Q-word: Where | Aux: do | Subject: you | Verb: live)*",
        "• **{What}** **{does}** {she} {study}? *(Q-word: What | Aux: does | Subject: she | Verb: study)*"
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Basic SVO Reordering",
      instruction: "Rearrange the jumbled words to build a grammatically correct declarative sentence (SVO).",
      items: [
        {
          type: "word-order",
          jumbled: ["apples", "likes", "she", "red"],
          correct: ["She", "likes", "red", "apples."],
          explanation: "Subject ('She') + Verb ('likes') + Object ('red apples' where adjective goes before noun).",
        },
        {
          type: "word-order",
          jumbled: ["pizza", "eat", "on", "they", "Fridays"],
          correct: ["They", "eat", "pizza", "on", "Fridays."],
          explanation: "Subject ('They') + Verb ('eat') + Object ('pizza') + time complement ('on Fridays').",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Question Reordering",
      instruction: "Rearrange the words to build correct English questions (ASV / QASV).",
      items: [
        {
          type: "word-order",
          jumbled: ["live", "where", "you", "do"],
          correct: ["Where", "do", "you", "live?"],
          explanation: "Wh-word ('Where') + Auxiliary ('do') + Subject ('you') + Verb ('live')?",
        },
        {
          type: "word-order",
          jumbled: ["like", "music", "she", "does"],
          correct: ["Does", "she", "like", "music?"],
          explanation: "Auxiliary ('Does') + Subject ('she') + Verb ('like') + Object ('music')?",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Adjective Placement",
      instruction: "Select the sentence with the correct placement and form of the adjective.",
      items: [
        {
          type: "mcq",
          question: "Which sentence is correct?",
          options: [
            "He lives in a house big.",
            "He lives in a big house.",
            "He lives in a bigs house.",
          ],
          answer: 1,
          explanation: "The adjective 'big' must go before the noun 'house'. Adjectives are never pluralized.",
        },
        {
          type: "mcq",
          question: "Which sentence is correct?",
          options: [
            "I have two black cats.",
            "I have two cats blacks.",
            "I have two blacks cats.",
          ],
          answer: 0,
          explanation: "Adjective goes before noun ('black cats'). Note that the adjective 'black' does not take an 's' even though 'cats' is plural.",
        },
        {
          type: "mcq",
          question: "Which sentence is correct?",
          options: [
            "We drink water hot.",
            "We drink hot water.",
            "We hot water drink.",
          ],
          answer: 1,
          explanation: "Adjective goes before the noun ('hot water'). Sentence follows SVO: We (S) + drink (V) + hot water (O).",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Error Spotting",
      instruction: "Spot the mistake in word order, subject deletion, or adjective form.",
      items: [
        {
          type: "error-spot",
          incorrect: "Is raining today in London.",
          correct: "It is raining today in London.",
          explanation: "In English, you cannot omit the subject 'It' for weather expressions.",
        },
        {
          type: "error-spot",
          incorrect: "I want a book interesting to read.",
          correct: "I want an interesting book to read.",
          explanation: "The adjective 'interesting' must go before the noun 'book'. Also, 'a' changes to 'an' because 'interesting' starts with a vowel sound.",
        },
        {
          type: "error-spot",
          incorrect: "You do like chocolate?",
          correct: "Do you like chocolate?",
          explanation: "In questions, the auxiliary 'Do' must go before the subject 'you'.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Sentence Structure Identification",
      instruction: "Choose the correct translation showing correct word order.",
      items: [
        {
          type: "fill-blank",
          prompt: "Translate: 'Me gusta la música clásica.'",
          options: [
            "Me likes classical music.",
            "I like classical music.",
            "I like music classical.",
          ],
          answer: 1,
          explanation: "English requires Subject ('I') + Verb ('like') + Object ('classical music' with adjective before noun).",
        },
        {
          type: "fill-blank",
          prompt: "Translate: '¿A qué hora empieza la clase?'",
          options: [
            "What time does the class start?",
            "What time the class starts?",
            "What does time the class start?",
          ],
          answer: 0,
          explanation: "Question format: Question phrase ('What time') + auxiliary ('does') + subject ('the class') + verb ('start')?",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Word Order (SVO)",
    instruction: "Complete this 10-question test to verify you understand English word order and structure rules.",
    items: [
      {
        type: "fill-blank",
        prompt: "___ is very cold in this room.",
        options: ["Is", "It", "He", "There"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "They bought a ___ car.",
        options: ["new blue", "blue new", "car new", "new blues"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "Where ___ your sister work?",
        options: ["do", "does", "is", "are"],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which of the following sentences has the correct order?",
        options: [
          "English speaks my father very well.",
          "My father speaks very well English.",
          "My father speaks English very well.",
        ],
        answer: 2,
      },
      {
        type: "mcq",
        question: "Which of the following questions is correct?",
        options: [
          "How old are you?",
          "How old you are?",
          "How are old you?",
        ],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "She has three ___ bags.",
        options: ["yellows", "yellow", "bag yellow"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "___ you want some tea?",
        options: ["Do", "Does", "Are", "Is"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "He does not like ___ food.",
        options: ["spicy", "food spicy", "spicies"],
        answer: 0,
      },
      {
        type: "error-spot",
        incorrect: "She has eyes blues.",
        correct: "She has blue eyes.",
        explanation: "Adjectives go before the noun and are never pluralized: 'blue eyes'.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "I every morning drink milk.",
          "I drink milk every morning.",
          "Every morning I milk drink.",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "subject",
      translation: "sujeto",
      definition: "The noun or pronoun that performs the action in a sentence.",
      example: "In 'He eats apples', 'He' is the subject.",
      partOfSpeech: "noun",
    },
    {
      word: "verb",
      translation: "verbo",
      definition: "A word that describes an action, occurrence, or state of being.",
      example: "Run, speak, and be are verbs.",
      partOfSpeech: "noun",
    },
    {
      word: "object",
      translation: "objeto / complemento directo",
      definition: "The noun or pronoun that receives the action of a verb.",
      example: "In 'I like milk', 'milk' is the object.",
      partOfSpeech: "noun",
    },
    {
      word: "adjective",
      translation: "adjetivo",
      definition: "A word that describes or modifies a noun.",
      example: "'Blue' and 'happy' are adjectives.",
      partOfSpeech: "noun",
    },
    {
      word: "sentence",
      translation: "oración / frase",
      definition: "A set of words that is complete in itself, containing a subject and a verb.",
      example: "She writes a letter is a sentence.",
      partOfSpeech: "noun",
    },
    {
      word: "question",
      translation: "pregunta",
      definition: "A sentence expressed in a form that requires an answer.",
      example: "Do you understand this question?",
      partOfSpeech: "noun",
    },
    {
      word: "order",
      translation: "orden",
      definition: "The arrangement or sequence of things.",
      example: "The alphabetical order is useful.",
      partOfSpeech: "noun",
    },
    {
      word: "structure",
      translation: "estructura",
      definition: "The way in which parts of a sentence are arranged or put together.",
      example: "English has a strict sentence structure.",
      partOfSpeech: "noun",
    },
    {
      word: "it rains",
      translation: "llueve",
      definition: "Water falling in drops from the sky (requires pronoun subject 'it').",
      example: "It rains a lot in winter.",
      partOfSpeech: "phrase",
    },
    {
      word: "easy",
      translation: "fácil",
      definition: "Not difficult; requiring little effort.",
      example: "This English exam is easy.",
      partOfSpeech: "adjective",
    },
  ],
};

export default unit11;
