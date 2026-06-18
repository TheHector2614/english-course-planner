import type { UnitData } from "./types";

const unit09: UnitData = {
  id: "a1-09",
  title: "Ability & Frequency",
  level: "A1",
  description:
    "Learn to express abilities using the modal verb {can} / {can't}, and talk about routines using adverbs of frequency like {always}, {sometimes}, and {never}.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "can-ability",
      title: "🏃 The Modal Verb Can: Ability & Permission",
      paragraphs: [
        "The modal verb {can} is used to talk about physical or mental abilities (what we are able to do) and to ask for permission. It translates as 'poder' in Spanish.",
        "",
        "**Key Rules for Can:**",
        "1. It is the same for all subjects (I/you/he/she/it/we/they can). No '-s' for the third person singular!",
        "2. It is followed by the bare infinitive (infinitive without 'to'): {can swim} (not can to swim).",
        "3. The negative contraction is {can't} (or the formal {cannot}).",
        "4. In questions, the word order is inverted: Can + Subject + Verb?",
        "",
        "[TABLE]\nStructure | Formula | Example\nAffirmative | Subject + {can} + Verb | He {can} play the guitar.\nNegative | Subject + {can't} + Verb | They {can't} speak French.\nQuestion | {can} + Subject + Verb? | {can} you swim?\nShort Answer | Yes, [Subj] {can}. / No, [Subj] {can't}. | Yes, I {can}. / No, he {can't}."
      ],
    },
    {
      id: "adverbs-frequency",
      title: "⏰ Adverbs of Frequency",
      paragraphs: [
        "Adverbs of frequency describe how often an action happens. They help us give detail to our routines.",
        "",
        "**Common Adverbs of Frequency:**",
        "• **{always}** (100%): I {always} brush my teeth.",
        "• **{usually}** (90%): She {usually} walks to school.",
        "• **{often}** (70%): We {often} cook dinner at home.",
        "• **{sometimes}** (50%): They {sometimes} watch movies.",
        "• **{rarely} / {seldom}** (10%): He {rarely} drinks coffee.",
        "• **{never}** (0%): I {never} arrive late.",
        "",
        "**Word Order / Placement Rules:**",
        "1. **Before the main verb**: Subject + Adverb + Verb. (e.g., I {always} eat breakfast).",
        "2. **After the verb 'to be'**: Subject + To Be + Adverb. (e.g., She is {usually} happy).",
        "3. **After modal verbs**: Subject + Modal + Adverb + Verb. (e.g., I can {never} remember his name)."
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Ability with Can & Can't",
      instruction: "Choose between 'can' or 'can't' based on logical ability or context.",
      items: [
        {
          type: "fill-blank",
          prompt: "Birds ___ fly, but they ___ swim.",
          options: ["can / can't", "can't / can", "can / can"],
          answer: 0,
          explanation: "Birds have the ability to fly ('can') but generally do not have the ability to swim ('can't').",
        },
        {
          type: "fill-blank",
          prompt: "I ___ speak Chinese. It is too difficult for me.",
          options: ["can", "can't", "can to"],
          answer: 1,
          explanation: "The second sentence shows inability → 'can't'. Also, modal verbs never take 'to' before the infinitive.",
        },
        {
          type: "fill-blank",
          prompt: "___ you run five kilometers?",
          options: ["Can", "Do", "Are"],
          answer: 0,
          explanation: "To ask about physical ability, we start the question with the modal verb 'Can'.",
        },
        {
          type: "fill-blank",
          prompt: "She is a chef, so she ___ cook delicious food.",
          options: ["can't", "can", "cans"],
          answer: 1,
          explanation: "Since she is a chef, she has the ability → 'can'. Note that 'can' never adds '-s'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Placement of Frequency Adverbs",
      instruction: "Select the sentence that has the adverb of frequency in the grammatically correct position.",
      items: [
        {
          type: "mcq",
          question: "Choose the correct sentence:",
          options: [
            "We go usually to the park on Saturdays.",
            "We usually go to the park on Saturdays.",
            "Usually we to the park go on Saturdays.",
          ],
          answer: 1,
          explanation: "Adverbs of frequency go before the main verb ('go') → 'We usually go...'.",
        },
        {
          type: "mcq",
          question: "Choose the correct sentence:",
          options: [
            "He is always tired after work.",
            "He always is tired after work.",
            "He is tired always after work.",
          ],
          answer: 0,
          explanation: "Adverbs of frequency go after the verb 'to be' ('is') → 'He is always tired...'.",
        },
        {
          type: "mcq",
          question: "Choose the correct sentence:",
          options: [
            "I can never swim in the cold water.",
            "I never can swim in the cold water.",
            "I can swim never in the cold water.",
          ],
          answer: 0,
          explanation: "Adverbs of frequency go after the modal verb ('can') and before the main verb ('swim') → 'I can never swim...'.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Error Spotting",
      instruction: "Spot and correct the errors with 'can' or adverbs of frequency.",
      items: [
        {
          type: "error-spot",
          incorrect: "My brother cans play basketball very well.",
          correct: "My brother can play basketball very well.",
          explanation: "Modal verbs like 'can' do not change for the third person singular. Never write 'cans'.",
        },
        {
          type: "error-spot",
          incorrect: "She plays always tennis on Sunday mornings.",
          correct: "She always plays tennis on Sunday mornings.",
          explanation: "The adverb of frequency 'always' must go before the main verb 'plays'.",
        },
        {
          type: "error-spot",
          incorrect: "I can to run fast.",
          correct: "I can run fast.",
          explanation: "We do not use 'to' after modal verbs. It must be 'can run' (bare infinitive).",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Word Order Reordering",
      instruction: "Put the words in the correct order to make a complete sentence or question.",
      items: [
        {
          type: "word-order",
          jumbled: ["guitar", "she", "play", "can't", "the"],
          correct: ["She", "can't", "play", "the", "guitar."],
          explanation: "Sentence order: Subject ('She') + negative modal ('can't') + action verb ('play') + object ('the guitar').",
        },
        {
          type: "word-order",
          jumbled: ["late", "is", "he", "sometimes", "school", "for"],
          correct: ["He", "is", "sometimes", "late", "for", "school."],
          explanation: "With the verb 'to be', the adverb goes after it: Subject ('He') + 'is' + 'sometimes' + adjective/complements.",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Frequency Adverb Fill-In",
      instruction: "Choose the correct adverb of frequency based on the percentage or cue given in parentheses.",
      items: [
        {
          type: "fill-blank",
          prompt: "I ___ (0%) drink alcohol. I hate the taste.",
          options: ["always", "sometimes", "never"],
          answer: 2,
          explanation: "0% frequency is expressed using 'never'.",
        },
        {
          type: "fill-blank",
          prompt: "Mary is a very serious student; she ___ (100%) does her homework.",
          options: ["always", "rarely", "sometimes"],
          answer: 0,
          explanation: "100% frequency is expressed using 'always'.",
        },
        {
          type: "fill-blank",
          prompt: "They ___ (50%) order pizza on Fridays, but not every week.",
          options: ["usually", "sometimes", "never"],
          answer: 1,
          explanation: "50% frequency (about half the time) is expressed using 'sometimes'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Ability & Frequency",
    instruction: "Complete the 10 questions to prove you understand ability structures and routines.",
    items: [
      {
        type: "fill-blank",
        prompt: "They ___ speak English very well. They are from London.",
        options: ["can", "can't", "do can"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "Can you ___ the piano?",
        options: ["play", "to play", "playing"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "No, I ___.",
        options: ["can", "can't", "don't can"],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which of the following is correct?",
        options: [
          "He often is happy.",
          "He is often happy.",
          "He is happy often.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which of the following is correct?",
        options: [
          "I rarely eat fast food.",
          "I eat rarely fast food.",
          "Rarely I eat fast food.",
        ],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "He ___ swim. He is terrified of water.",
        options: ["can", "can't", "cans"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "We ___ (90% frequency) have lunch at 1:00 PM.",
        options: ["always", "usually", "never"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Do you ___ arrive late to meetings?",
        options: ["always", "ever", "never"],
        answer: 1,
      },
      {
        type: "error-spot",
        incorrect: "She can cooks pasta perfectly.",
        correct: "She can cook pasta perfectly.",
        explanation: "After 'can', we must use the base form of the verb without '-s'.",
      },
      {
        type: "mcq",
        question: "Choose the correct question:",
        options: [
          "You can help me, please?",
          "Can you help me, please?",
          "Can you to help me, please?",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "can",
      translation: "poder / saber (hacer algo)",
      definition: "Modal verb used to express physical/mental ability or permission.",
      example: "She can play the violin.",
      partOfSpeech: "verb",
    },
    {
      word: "can't",
      translation: "no poder / no saber (hacer algo)",
      definition: "Contraction of 'cannot'; expresses inability or lack of permission.",
      example: "He can't swim in deep water.",
      partOfSpeech: "verb",
    },
    {
      word: "always",
      translation: "siempre",
      definition: "At all times; on every occasion (100% frequency).",
      example: "I always wake up at 6 AM.",
      partOfSpeech: "adverb",
    },
    {
      word: "usually",
      translation: "generalmente / por lo general",
      definition: "Under normal conditions; generally (90% frequency).",
      example: "We usually walk to work.",
      partOfSpeech: "adverb",
    },
    {
      word: "often",
      translation: "a menudo / frecuentemente",
      definition: "Many times or at short intervals (70% frequency).",
      example: "They often go to the cinema.",
      partOfSpeech: "adverb",
    },
    {
      word: "sometimes",
      translation: "a veces / algunas veces",
      definition: "Occasionally; now and then (50% frequency).",
      example: "Sometimes I read books before sleeping.",
      partOfSpeech: "adverb",
    },
    {
      word: "never",
      translation: "nunca / jamás",
      definition: "Not at any time; not on any occasion (0% frequency).",
      example: "I never drink black coffee.",
      partOfSpeech: "adverb",
    },
    {
      word: "rarely",
      translation: "raramente / rara vez",
      definition: "Not often; seldom (10% frequency).",
      example: "He rarely travels abroad.",
      partOfSpeech: "adverb",
    },
    {
      word: "speak",
      translation: "hablar",
      definition: "To say words, or to be able to communicate in a language.",
      example: "Can you speak Spanish?",
      partOfSpeech: "verb",
    },
    {
      word: "swim",
      translation: "nadar",
      definition: "To move through water by moving the body.",
      example: "She can swim very fast.",
      partOfSpeech: "verb",
    },
  ],
};

export default unit09;
