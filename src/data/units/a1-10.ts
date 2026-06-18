import type { UnitData } from "./types";

const unit10: UnitData = {
  id: "a1-10",
  title: "Present Continuous",
  level: "A1",
  description:
    "Learn how to describe actions happening right now using the Present Continuous tense (Subject + be + verb-ing) and contrast it with the Present Simple.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "structure",
      title: "🛠️ Structure of the Present Continuous",
      paragraphs: [
        "The Present Continuous (also called Present Progressive) is used to talk about actions that are happening right now, at this exact moment. In Spanish, it corresponds to 'estar + gerundio' (ej. estoy comiendo).",
        "",
        "**Formula:** Subject + Verb 'To Be' (am/is/are) + Main Verb ending in '-ing'.",
        "",
        "[TABLE]\nStructure | Formula | Example\nAffirmative | Subject + {am/is/are} + Verb-ing | I {am reading} a book.\nNegative | Subject + {am/is/are not} + Verb-ing | He {is not studying} today. *(isn't)*\nQuestion | {am/is/are} + Subject + Verb-ing? | {are they watching} TV?\nShort Answer | Yes, [Subj] + To Be / No, [Subj] + To Be + not | Yes, I am. / No, she isn't."
      ],
    },
    {
      id: "spelling-rules",
      title: "✍️ Spelling Rules for -ing Verbs",
      paragraphs: [
        "Adding '-ing' to verbs usually is simple, but there are some spelling rules depending on the ending of the verb:",
        "",
        "1. **Most verbs**: Add **-ing** directly.",
        "   - {work} → {working}, {study} → {studying}, {read} → {reading}.",
        "",
        "2. **Verbs ending in '-e'**: Drop the **-e** and add **-ing**.",
        "   - {write} → {writing}, {make} → {making}, {dance} → {dancing}, {live} → {living}.",
        "",
        "3. **Verbs ending in Consonant + Vowel + Consonant (CVC)** of one syllable: **Double** the final consonant and add **-ing**.",
        "   - {run} → {running}, {swim} → {swimming}, {sit} → {sitting}, {stop} → {stopping}.",
        "   - *Exception: Do not double if the verb ends in w, x, or y (e.g. play → playing).* ",
        "",
        "4. **Verbs ending in '-ie'**: Change **-ie** to **-y** and add **-ing**.",
        "   - {lie} (mentir/tumbarse) → {lying}, {die} (morir) → {dying}."
      ],
    },
    {
      id: "contrast-simple-continuous",
      title: "🔄 Present Simple vs. Present Continuous",
      paragraphs: [
        "It is important to know when to use Present Simple (rutinas/hechos) versus Present Continuous (acciones ahora).",
        "",
        "**Time Markers comparison:**",
        "• **Present Simple**: {every day}, {usually}, {always}, {on Mondays}, {once a week}.",
        "• **Present Continuous**: {now}, {at the moment}, {right now}, {today}, {look!}, {listen!}.",
        "",
        "[TABLE]\nAspect | Present Simple | Present Continuous\nUsage | Routines, habits, permanent facts | Actions happening right now / temporary situations\nExample | I {play} tennis every Sunday. | I {am playing} tennis right now.\nVerb Form | Base form or +s/es (third person) | am/is/are + verb-ing\nNegatives | use don't / doesn't + base verb | am not / isn't / aren't + verb-ing"
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Conjugating Present Continuous",
      instruction: "Choose the correct form of the verb 'to be' and '-ing' to complete the sentence.",
      items: [
        {
          type: "fill-blank",
          prompt: "Look! The dog ___ in the garden.",
          options: ["is running", "are running", "run"],
          answer: 0,
          explanation: "'The dog' is singular (it) → 'is running' (double 'n').",
        },
        {
          type: "fill-blank",
          prompt: "I ___ English at the moment.",
          options: ["am studying", "is studying", "studying"],
          answer: 0,
          explanation: "Subject 'I' takes 'am' + 'studying'.",
        },
        {
          type: "fill-blank",
          prompt: "They ___ a film right now. They are asleep.",
          options: ["are watching", "aren't watching", "isn't watching"],
          answer: 1,
          explanation: "Since they are asleep, they are NOT watching a film → 'aren't watching'.",
        },
        {
          type: "fill-blank",
          prompt: "___ you ___ breakfast now?",
          options: ["Are / eating", "Is / eating", "Do / eat"],
          answer: 0,
          explanation: "Question for 'you' in present continuous → 'Are you eating?'.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Present Simple vs. Present Continuous",
      instruction: "Choose the correct verb tense based on the time marker in the sentence.",
      items: [
        {
          type: "mcq",
          question: "She usually ___ coffee, but today she ___ tea.",
          options: [
            "drinks / is drinking",
            "is drinking / drinks",
            "drink / is drinking",
          ],
          answer: 0,
          explanation: "'usually' triggers Present Simple ('drinks') and 'today' triggers Present Continuous ('is drinking').",
        },
        {
          type: "mcq",
          question: "Listen! Somebody ___ in the shower.",
          options: ["sings", "is singing", "are singing"],
          answer: 1,
          explanation: "'Listen!' indicates the action is happening at this moment → 'is singing'.",
        },
        {
          type: "mcq",
          question: "My father ___ in a bank. He is an accountant.",
          options: ["works", "is working", "work"],
          answer: 0,
          explanation: "This is a permanent fact/job → Present Simple ('works').",
        },
        {
          type: "mcq",
          question: "We ___ TV every evening.",
          options: ["are watching", "watch", "watches"],
          answer: 1,
          explanation: "'every evening' describes a routine → Present Simple ('watch').",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: Spelling Checker",
      instruction: "Select the correct spelling of the -ing verb form.",
      items: [
        {
          type: "mcq",
          question: "Spelling of: make + ing",
          options: ["makeing", "making", "makking"],
          answer: 1,
          explanation: "Verbs ending in silent '-e' drop the '-e' before adding '-ing'.",
        },
        {
          type: "mcq",
          question: "Spelling of: swim + ing",
          options: ["swiming", "swimming", "swimeing"],
          answer: 1,
          explanation: "One-syllable verb ending in CVC (w-i-m) doubles the last consonant → 'swimming'.",
        },
        {
          type: "mcq",
          question: "Spelling of: write + ing",
          options: ["writing", "writeing", "writting"],
          answer: 0,
          explanation: "Drop the '-e' → 'writing'. (Note: only one 't' in write/writing, unlike written).",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Question Order",
      instruction: "Arrange the words to build a correct question in the Present Continuous.",
      items: [
        {
          type: "word-order",
          jumbled: ["doing", "are", "what", "you", "now"],
          correct: ["What", "are", "you", "doing", "now?"],
          explanation: "Wh-question structure: Wh-word + be + subject + verb-ing + time word?",
        },
        {
          type: "word-order",
          jumbled: ["is", "the", "crying", "baby", "why"],
          correct: ["Why", "is", "the", "baby", "crying?"],
          explanation: "Wh-word + is + subject ('the baby') + verb-ing ('crying')?",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Correct the sentence to fix errors in present continuous structure or spelling.",
      items: [
        {
          type: "error-spot",
          incorrect: "I running to the gym at the moment.",
          correct: "I am running to the gym at the moment.",
          explanation: "You cannot omit the auxiliary verb 'to be' (am/is/are) in Present Continuous.",
        },
        {
          type: "error-spot",
          incorrect: "She is makeing dinner for us.",
          correct: "She is making dinner for us.",
          explanation: "The silent '-e' in 'make' must be dropped before adding '-ing'.",
        },
        {
          type: "error-spot",
          incorrect: "They are study English today.",
          correct: "They are studying English today.",
          explanation: "The main verb needs the '-ing' ending → 'studying'.",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Present Continuous",
    instruction: "Answer the 10 questions to demonstrate mastery of the continuous forms.",
    items: [
      {
        type: "fill-blank",
        prompt: "Where is John? He ___ a shower.",
        options: ["has", "is having", "having"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "We ___ playing football; we are playing tennis.",
        options: ["aren't", "don't", "isn't"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "What ___ they eating?",
        options: ["do", "are", "is"],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "He is runing in the park.",
          "He is running in the park.",
          "He runs in the park at the moment.",
        ],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which sentence is correct?",
        options: [
          "Look! It is raining.",
          "Look! It rains.",
          "Look! It is rain.",
        ],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "I ___ (always) listen to music in the car.",
        options: ["am always", "always", "am always listening"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Please be quiet. I ___ to work.",
        options: ["try", "am trying", "trying"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "Why ___ you wearing a coat? It is warm today.",
        options: ["are", "do", "is"],
        answer: 0,
      },
      {
        type: "error-spot",
        incorrect: "Are you writeing an email?",
        correct: "Are you writing an email?",
        explanation: "The verb 'write' ends in '-e', so we drop the '-e' before adding '-ing' → 'writing'.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "He is study history at university.",
          "He is studying history at university.",
          "He studies history at university at the moment.",
        ],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "at the moment",
      translation: "en este momento",
      definition: "At the present time; now.",
      example: "I am studying English at the moment.",
      partOfSpeech: "phrase",
    },
    {
      word: "right now",
      translation: "ahora mismo",
      definition: "Immediately; at this exact instant.",
      example: "She is calling her mother right now.",
      partOfSpeech: "phrase",
    },
    {
      word: "study",
      translation: "estudiar",
      definition: "To learn about a subject by reading books or attending school.",
      example: "They are studying for their final exam.",
      partOfSpeech: "verb",
    },
    {
      word: "read",
      translation: "leer",
      definition: "To look at and understand written words.",
      example: "I am reading an interesting magazine.",
      partOfSpeech: "verb",
    },
    {
      word: "write",
      translation: "escribir",
      definition: "To produce words or letters on paper or on a screen.",
      example: "He is writing a letter to his friend.",
      partOfSpeech: "verb",
    },
    {
      word: "run",
      translation: "correr",
      definition: "To move quickly on foot, faster than walking.",
      example: "She is running a marathon today.",
      partOfSpeech: "verb",
    },
    {
      word: "watch",
      translation: "mirar / ver",
      definition: "To look at something for a period of time, especially something that moves.",
      example: "They are watching a football match.",
      partOfSpeech: "verb",
    },
    {
      word: "listen",
      translation: "escuchar",
      definition: "To pay attention to a sound or to what someone says.",
      example: "Listen to the birds singing!",
      partOfSpeech: "verb",
    },
    {
      word: "cook",
      translation: "cocinar",
      definition: "To prepare food by heating it.",
      example: "My father is cooking dinner tonight.",
      partOfSpeech: "verb",
    },
    {
      word: "sleep",
      translation: "dormir",
      definition: "To rest in a state of natural unconsciousness.",
      example: "The baby is sleeping in the crib.",
      partOfSpeech: "verb",
    },
  ],
};

export default unit10;
