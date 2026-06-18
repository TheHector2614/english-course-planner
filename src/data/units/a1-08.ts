import type { UnitData } from "./types";

const unit08: UnitData = {
  id: "a1-08",
  title: "Countable & Uncountable Nouns",
  level: "A1",
  description:
    "Learn the difference between nouns you can count and those you cannot, and master how to use {some}, {any}, {how much}, and {how many}.",

  // ── TEORÍA ──────────────────────────────────
  sections: [
    {
      id: "countable-uncountable",
      title: "🍎 Countable vs. Uncountable Nouns",
      paragraphs: [
        "In English, nouns are divided into two main categories: countable (contables) and uncountable (incontables). Understanding this difference is crucial for using articles and quantities correctly.",
        "",
        "**Countable Nouns** are things we can count individually using numbers. They have both singular and plural forms:",
        "• Singular: {an apple}, {a book}, {a banana}.",
        "• Plural: {two apples}, {three books}, {four bananas}.",
        "",
        "**Uncountable Nouns** are things we cannot count individually. They represent substances, liquids, powders, or abstract concepts. They only have a singular form and cannot be used directly with 'a' or 'an':",
        "• Liquids: {water}, {milk}, {coffee}, {juice}.",
        "• Food/Substances: {bread}, {cheese}, {meat}, {sugar}, {salt}, {rice}.",
        "• Abstract/General: {money}, {time}, {information}, {music}.",
        "",
        "[TABLE]\nNoun Type | Can use numbers? | Has plural form? | Example\nCountable | Yes (one, two, three...) | Yes (s/es/ies) | {a carrot} / {carrots}\nUncountable | No | No (always singular) | {water} (not waters)"
      ],
    },
    {
      id: "some-any",
      title: "🍕 Using Some & Any",
      paragraphs: [
        "We use {some} and {any} to talk about indefinite quantities. They can be used with both plural countable nouns and uncountable nouns.",
        "",
        "• **{some}** (algo de / algunos): Used in **affirmative** sentences and **offers/requests**.",
        "  - Affirmative: I have {some} apples (countable plural).",
        "  - Affirmative: There is {some} milk in the fridge (uncountable).",
        "  - Offer: Would you like {some} coffee? *(Polite offer)*",
        "  - Request: Can I have {some} water, please? *(Polite request)*",
        "",
        "• **{any}** (nada de / ningún / alguna): Used in **negative** sentences and general **questions**.",
        "  - Negative: We don't have {any} bread (uncountable negative).",
        "  - Negative: There aren't {any} bananas left (countable plural negative).",
        "  - Question: Is there {any} sugar? (uncountable question).",
        "  - Question: Do you have {any} coins? (countable plural question).",
      ],
    },
    {
      id: "how-much-many",
      title: "📊 How Much vs. How Many & Quantifiers",
      paragraphs: [
        "To ask about quantities, we use different phrases depending on whether the noun is countable or uncountable:",
        "",
        "• **{how many}** + Plural Countable Noun (¿Cuántos / Cuántas?):",
        "  - {How many} tomatoes do we need?",
        "  - {How many} friends do you have?",
        "",
        "• **{how much}** + Uncountable Noun (¿Cuánto / Cuánta?):",
        "  - {How much} money do you need?",
        "  - {How much} water is in the bottle?",
        "",
        "**Quantifiers table:**",
        "[TABLE]\nQuantifier | Meaning | Countable | Uncountable\n{a lot of} | mucho / gran cantidad | Yes (apples) | Yes (water)\n{many} | muchos / muchas | Yes (only in neg/questions) | No\n{much} | mucho / mucha | No | Yes (only in neg/questions)\n{a few} | unos pocos / unas pocas | Yes | No\n{a little} | un poco de | No | Yes"
      ],
    },
  ],

  // ── EJERCICIOS ───────────────────────────────
  exercises: [
    {
      id: "ex-1",
      title: "Exercise 1: Countable vs. Uncountable",
      instruction: "Identify whether the noun in bold is countable or uncountable by choosing the correct category.",
      items: [
        {
          type: "fill-blank",
          prompt: "I drink green ___ (tea) every morning.",
          options: ["Countable", "Uncountable"],
          answer: 1,
          explanation: "Liquids like 'tea' are uncountable.",
        },
        {
          type: "fill-blank",
          prompt: "There are four ___ (oranges) on the table.",
          options: ["Countable", "Uncountable"],
          answer: 0,
          explanation: "Oranges can be counted individually and have a plural form.",
        },
        {
          type: "fill-blank",
          prompt: "I need to buy some ___ (bread).",
          options: ["Countable", "Uncountable"],
          answer: 1,
          explanation: "'Bread' is considered uncountable in English; we count 'loaves' or 'slices' of bread.",
        },
        {
          type: "fill-blank",
          prompt: "We have some ___ (money) in the bank.",
          options: ["Countable", "Uncountable"],
          answer: 1,
          explanation: "While currency units are countable (dollars, euros), the word 'money' itself is uncountable.",
        },
      ],
    },
    {
      id: "ex-2",
      title: "Exercise 2: Some vs. Any",
      instruction: "Choose the correct word (some / any / a / an) to complete the sentence.",
      items: [
        {
          type: "mcq",
          question: "I don't have ___ apples in my bag.",
          options: ["some", "any", "a", "an"],
          answer: 1,
          explanation: "This is a negative sentence with a plural countable noun, so we use 'any'.",
        },
        {
          type: "mcq",
          question: "Would you like ___ water?",
          options: ["some", "any", "a", "an"],
          answer: 0,
          explanation: "Even though it is a question, it is an offer, so we use 'some' to be polite.",
        },
        {
          type: "mcq",
          question: "There is ___ cheese in the kitchen.",
          options: ["some", "any", "a", "an"],
          answer: 0,
          explanation: "This is an affirmative sentence with an uncountable noun, so we use 'some'.",
        },
        {
          type: "mcq",
          question: "Do they have ___ information about the train?",
          options: ["some", "any", "a", "an"],
          answer: 1,
          explanation: "This is a general question, so we use 'any' with the uncountable noun 'information'.",
        },
      ],
    },
    {
      id: "ex-3",
      title: "Exercise 3: How Much vs. How Many",
      instruction: "Choose the correct phrase ('How much' or 'How many') to start the question.",
      items: [
        {
          type: "mcq",
          question: "___ sugar do you put in your coffee?",
          options: ["How much", "How many"],
          answer: 0,
          explanation: "'Sugar' is uncountable, so we use 'How much'.",
        },
        {
          type: "mcq",
          question: "___ people live in this house?",
          options: ["How much", "How many"],
          answer: 1,
          explanation: "'People' is the plural of 'person' (countable), so we use 'How many'.",
        },
        {
          type: "mcq",
          question: "___ milk do we have in the fridge?",
          options: ["How much", "How many"],
          answer: 0,
          explanation: "'Milk' is a liquid (uncountable), so we use 'How much'.",
        },
        {
          type: "mcq",
          question: "___ apples are on the tree?",
          options: ["How much", "How many"],
          answer: 1,
          explanation: "'Apples' is a plural countable noun, so we use 'How many'.",
        },
      ],
    },
    {
      id: "ex-4",
      title: "Exercise 4: Question Order",
      instruction: "Rearrange the words to form correct English questions about quantities.",
      items: [
        {
          type: "word-order",
          jumbled: ["sugar", "do", "you", "much", "want", "how"],
          correct: ["How", "much", "sugar", "do", "you", "want?"],
          explanation: "Form: How much + uncountable noun + auxiliary + subject + verb?",
        },
        {
          type: "word-order",
          jumbled: ["any", "is", "there", "in", "fridge", "milk", "the"],
          correct: ["Is", "there", "any", "milk", "in", "the", "fridge?"],
          explanation: "Form: Is there + any + uncountable noun + location prepositional phrase?",
        },
      ],
    },
    {
      id: "ex-5",
      title: "Exercise 5: Error Spotting",
      instruction: "Find the grammatical mistake in sentences containing countable/uncountable nouns or quantifiers.",
      items: [
        {
          type: "error-spot",
          incorrect: "I want a bread for breakfast.",
          correct: "I want some bread for breakfast.",
          explanation: "'Bread' is uncountable; you cannot use the indefinite article 'a' directly. You must use 'some' or 'a slice of bread'.",
        },
        {
          type: "error-spot",
          incorrect: "How many money do you spend every week?",
          correct: "How much money do you spend every week?",
          explanation: "'Money' is uncountable, so it requires 'How much' instead of 'How many'.",
        },
        {
          type: "error-spot",
          incorrect: "She has a few juice in her glass.",
          correct: "She has a little juice in her glass.",
          explanation: "'Juice' is uncountable; use 'a little' instead of 'a few' (which is only for countables).",
        },
      ],
    },
  ],

  // ── EVALUACIÓN FINAL ─────────────────────────
  evaluation: {
    id: "evaluation",
    title: "📝 Final Evaluation — Countable & Uncountable",
    instruction: "Answer all 10 questions to test your proficiency on food, drinks, some/any, and quantifiers.",
    items: [
      {
        type: "fill-blank",
        prompt: "Can I have ___ water, please?",
        options: ["some", "any", "a", "an"],
        answer: 0,
      },
      {
        type: "fill-blank",
        prompt: "How ___ tomatoes do we need for the salad?",
        options: ["much", "many", "some", "any"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "I don't have ___ money today.",
        options: ["some", "any", "a", "many"],
        answer: 1,
      },
      {
        type: "mcq",
        question: "Which of the following is an UNCOUNTABLE noun?",
        options: ["egg", "banana", "rice", "potato"],
        answer: 2,
      },
      {
        type: "mcq",
        question: "Which of the following is a COUNTABLE noun?",
        options: ["water", "bread", "cheese", "carrot"],
        answer: 3,
      },
      {
        type: "fill-blank",
        prompt: "There is only a ___ milk left in the bottle.",
        options: ["few", "little", "many", "any"],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "I have a ___ friends in London.",
        options: ["little", "few", "much", "any"],
        answer: 1,
      },
      {
        type: "error-spot",
        incorrect: "There are some coffee on the desk.",
        correct: "There is some coffee on the desk.",
        explanation: "'Coffee' is uncountable, so it takes the singular verb form 'is'.",
      },
      {
        type: "mcq",
        question: "Choose the correct sentence:",
        options: [
          "Do you have some books?",
          "Do you have any books?",
          "Do you have a books?",
        ],
        answer: 1,
      },
      {
        type: "fill-blank",
        prompt: "How ___ sugar do you like in your tea?",
        options: ["many", "much", "some", "any"],
        answer: 1,
      },
    ],
  },

  // ── VOCABULARIO DE LA UNIDAD ────────────────
  vocabulary: [
    {
      word: "some",
      translation: "algo de / algunos / algunas",
      definition: "An indefinite amount or number, used mainly in affirmative sentences.",
      example: "I would like some water, please.",
      partOfSpeech: "determiner",
    },
    {
      word: "any",
      translation: "nada de / ningún / alguna / alguno",
      definition: "Used in negative sentences and questions to refer to an indefinite quantity.",
      example: "Do you have any questions?",
      partOfSpeech: "determiner",
    },
    {
      word: "how much",
      translation: "¿cuánto? / ¿cuánta?",
      definition: "Interrogative expression used with uncountable nouns to ask about quantity.",
      example: "How much time do we have?",
      partOfSpeech: "phrase",
    },
    {
      word: "how many",
      translation: "¿cuántos? / ¿cuántas?",
      definition: "Interrogative expression used with plural countable nouns to ask about quantity.",
      example: "How many books did you read?",
      partOfSpeech: "phrase",
    },
    {
      word: "water",
      translation: "agua",
      definition: "A clear liquid, without color or taste, that falls from the sky as rain.",
      example: "Please drink a glass of water.",
      partOfSpeech: "noun",
    },
    {
      word: "bread",
      translation: "pan",
      definition: "A food made from flour, water, and yeast mixed together and baked.",
      example: "Can you cut a slice of bread?",
      partOfSpeech: "noun",
    },
    {
      word: "sugar",
      translation: "azúcar",
      definition: "A sweet substance, usually in the form of small white or brown crystals.",
      example: "Do you take sugar in your tea?",
      partOfSpeech: "noun",
    },
    {
      word: "money",
      translation: "dinero",
      definition: "Coins or paper bills used to buy things.",
      example: "She saves her money in a bank account.",
      partOfSpeech: "noun",
    },
    {
      word: "a few",
      translation: "unos pocos / unas pocas",
      definition: "A small number of, used with plural countable nouns.",
      example: "He has a few friends in the city.",
      partOfSpeech: "phrase",
    },
    {
      word: "a little",
      translation: "un poco de",
      definition: "A small quantity of, used with uncountable nouns.",
      example: "Add a little salt to the food.",
      partOfSpeech: "phrase",
    },
  ],
};

export default unit08;
