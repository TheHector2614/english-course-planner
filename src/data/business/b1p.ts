export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "Which phrase is best for politely interrupting a colleague who is speaking too long in a meeting?",
        options: [
          "Shut up and let others speak.",
          "Sorry to jump in, but we're running short on time.",
          "You've talked enough. Stop now.",
          "Can you finish? I need to say something."
        ],
        correct: 1,
        explanation: '"Sorry to jump in" is a polite, professional way to interrupt and manage meeting time.'
      },
      {
        id: 2,
        question: "If we _____ the supplier's offer, we _____ a better margin.",
        options: [
          "would accept / get",
          "accepted / would get",
          "accept / would have got",
          "accepted / will get"
        ],
        correct: 1,
        explanation: "This is a second conditional: 'If + past simple, would + base verb' — used for hypothetical situations."
      },
      {
        id: 3,
        question: "The client reported that the shipment _____ yet.",
        options: [
          "hasn't arrived",
          "hadn't arrived",
          "didn't arrive",
          "wouldn't arrive"
        ],
        correct: 1,
        explanation: "In reported speech, present perfect shifts to past perfect when the reporting verb is past tense."
      },
      {
        id: 4,
        question: "Which phrase is used to make a counteroffer in a negotiation?",
        options: [
          "That's final. Take it or leave it.",
          "I'm afraid that doesn't work for us. How about …?",
          "I completely agree with everything.",
          "Let me check with my manager later."
        ],
        correct: 1,
        explanation: '"How about …?" after a polite refusal is a standard way to present a counteroffer.'
      },
      {
        id: 5,
        question: "The report shows that sales _____ by 15% over the last quarter.",
        options: [
          "increased",
          "have been increasing",
          "were increasing",
          "increase"
        ],
        correct: 1,
        explanation: '"Have been increasing" (present perfect continuous) emphasises an ongoing trend up to the present.'
      },
      {
        id: 6,
        question: "Which phrase would you use to summarise a discussion at the end of a meeting?",
        options: [
          "To wrap up, we agreed to move forward with Option A.",
          "Let's start from the beginning again.",
          "Does anyone want to add anything else?",
          "I think we're done here."
        ],
        correct: 0,
        explanation: '"To wrap up" is a clear, professional way to signal a summary and closure in a meeting.'
      },
      {
        id: 7,
        question: "A new policy _____ by the board next Monday.",
        options: [
          "will be introduced",
          "will introduce",
          "is introducing",
          "introduces"
        ],
        correct: 0,
        explanation: "Passive voice (future): 'will be + past participle' — the policy is the recipient of the action."
      },
      {
        id: 8,
        question: "Choose the sentence that best expresses a polite request:",
        options: [
          "I need you to send me the file now.",
          "Send me the file immediately, please.",
          "I was wondering if you could send me the file.",
          "You should send me the file."
        ],
        correct: 2,
        explanation: '"I was wondering if you could …" is an indirect, highly polite request structure.'
      }
    ]
  },
  flashcards: [
    {
      front: "Chair a meeting",
      back: "/tʃeər ə ˈmiːtɪŋ/ — to act as the person who leads and manages a meeting",
      example: "Sarah will chair the quarterly review meeting tomorrow."
    },
    {
      front: "Counteroffer",
      back: "/ˈkaʊntərˌɒfər/ — a proposal made in response to an initial offer, changing some terms",
      example: "They rejected our first bid and made a counteroffer."
    },
    {
      front: "Concession",
      back: "/kənˈseʃən/ — something you give up or agree to in order to reach an agreement",
      example: "We had to make a concession on delivery time to close the deal."
    },
    {
      front: "Rapport",
      back: "/ræˈpɔːr/ — a friendly, harmonious relationship built on mutual trust",
      example: "Building rapport with clients is essential for long-term partnerships."
    },
    {
      front: "Upswing",
      back: "/ˈʌpswɪŋ/ — an increase or improvement in something, such as sales or profits",
      example: "The latest figures show an upswing in export demand."
    },
    {
      front: "Likely / Unlikely / Bound to",
      back: "/ˈlaɪkli/ /ʌnˈlaɪkli/ /baʊnd tə/ — expressions of probability: probable, improbable, certain",
      example: "We are bound to see a recovery next quarter, though a loss is unlikely."
    },
    {
      front: "Minutes (of a meeting)",
      back: "/ˈmɪnɪts/ — an official written record of what was discussed and decided in a meeting",
      example: "Could you take the minutes and circulate them to the team?"
    },
    {
      front: "Deadline",
      back: "/ˈdedlaɪn/ — the latest time by which something must be completed",
      example: "We're working to a tight deadline and need the figures by Friday."
    }
  ],
  fillBlank: [
    {
      sentence: "If I _____ the project lead, I would restructure the entire timeline.",
      answer: "were",
      options: ["was", "were", "am", "would be"],
      explanation: "Second conditional uses 'were' for all subjects in the 'if' clause."
    },
    {
      sentence: "The manager said that the quarterly targets _____ already been met.",
      answer: "had",
      options: ["have", "had", "has", "were"],
      explanation: "In reported speech, present perfect 'have been' shifts to past perfect 'had been'."
    },
    {
      sentence: "The new software _____ installed across all departments next month.",
      answer: "will be",
      options: ["will be", "is", "has been", "would be"],
      explanation: "Future passive: 'will be + past participle' describes an action that will happen to the subject."
    },
    {
      sentence: "I wouldn't mind if you _____ me the report a day early.",
      answer: "sent",
      options: ["send", "sent", "would send", "have sent"],
      explanation: "Second conditional in the 'if' clause requires past simple: 'if you sent'."
    },
    {
      sentence: "We _____ for a response from the client since last Tuesday.",
      answer: "have been waiting",
      options: ["waited", "have been waiting", "are waiting", "had waited"],
      explanation: "Present perfect continuous emphasises an action that started in the past and is still ongoing."
    }
  ],
  matchPairs: [
    { left: "Sorry to jump in", right: "Politely interrupt a meeting" },
    { left: "Just to clarify", right: "Confirm understanding of a point" },
    { left: "To wrap up", right: "Signal the closing summary" },
    { left: "How about we …?", right: "Propose a counteroffer" },
    { left: "I was wondering if …", right: "Make a polite request" },
    { left: "It is unlikely that …", right: "Express low probability" }
  ],
  reorder: [
    {
      words: ["wondering", "I", "you", "if", "was", "could", "the", "send", "budget"],
      correct: "I was wondering if you could send the budget."
    },
    {
      words: ["were", "you", "If", "the", "manager", "would", "what", "do", "you"],
      correct: "If you were the manager, what would you do?"
    },
    {
      points: ["quarter", "has", "increasing", "The", "been", "steadily", "demand"],
      correct: "The demand has been increasing steadily this quarter."
    },
    {
      words: ["will", "next", "decision", "The", "made", "be", "week"],
      correct: "The decision will be made next week."
    },
    {
      words: ["said", "the", "contract", "The", "been", "signed", "had", "that", "client"],
      correct: "The client said that the contract had been signed."
    }
  ],
  speaking: [
    {
      text: "I was wondering if you could send me the proposal by Thursday.",
      phonetic: "/aɪ wəz ˈwʌndərɪŋ ɪf juː kʊd sɛnd miː ðə prəˈpəʊzəl baɪ ˈθɜːzdeɪ/"
    },
    {
      text: "To wrap up, we have agreed on the main terms and will sign next week.",
      phonetic: "/tə ræp ʌp wiː hæv əˈɡriːd ɒn ðə meɪn tɜːmz ænd wɪl saɪn nekst wiːk/"
    },
    {
      text: "If we lowered the price, they would place a much larger order.",
      phonetic: "/ɪf wiː ˈləʊəd ðə praɪs ðeɪ wʊd pleɪs ə mʌtʃ ˈlɑːdʒər ˈɔːdər/"
    },
    {
      text: "The report shows that costs have been rising for six months.",
      phonetic: "/ðə rɪˈpɔːt ʃəʊz ðæt kɒsts hæv biːn ˈraɪzɪŋ fɔː sɪks mʌnθs/"
    },
    {
      text: "It is highly unlikely that they will accept our first offer.",
      phonetic: "/ɪt ɪz ˈhaɪli ʌnˈlaɪkli ðæt ðeɪ wɪl əkˈsept ˈaʊər fɜːst ˈɒfər/"
    }
  ],
  dictation: [
    { text: "The client said that the invoice had already been paid." },
    { text: "Would you mind rescheduling the meeting to next Tuesday?" },
    { text: "If the budget were approved, we would hire two more developers." },
    { text: "The negotiations have been ongoing for over three weeks now." },
    { text: "All outstanding orders will be shipped by the end of the month." }
  ],
  listening: [
    {
      text: "Good morning everyone. Before we move on, let me just summarise what we've covered. We agreed to extend the deadline by two weeks, and Sarah will prepare the revised timeline. James, you'll follow up with the client on the new terms. Is everyone happy with that?",
      question: "What did the team agree on regarding the deadline?",
      options: [
        "They will keep the original deadline.",
        "They will extend the deadline by two weeks.",
        "They will shorten the deadline.",
        "They have not decided yet."
      ],
      correct: 1
    },
    {
      text: "Thank you for the offer. We appreciate it, but unfortunately the pricing is still above our budget. I was wondering if you could consider a 10% discount if we commit to a two-year contract. That would really help us move forward.",
      question: "What is the speaker doing?",
      options: [
        "Accepting the offer without changes",
        "Ending the negotiation",
        "Making a counteroffer based on a longer contract",
        "Complaining about the product quality"
      ],
      correct: 2
    },
    {
      text: "Our sales have been increasing steadily over the past three months, and we are bound to hit our annual target by November. However, it is unlikely that we will exceed it unless we invest more in marketing. I recommend we allocate an additional budget for Q4 campaigns.",
      question: "What does the speaker recommend?",
      options: [
        "Lowering the annual target",
        "Investing more in marketing",
        "Cutting the Q4 budget",
        "Hiring more sales staff"
      ],
      correct: 1
    }
  ],
  errorCorrection: [
    {
      incorrect: "I was wondering if you can send me the file.",
      correct: "I was wondering if you could send me the file.",
      explanation: "After 'I was wondering if', we use 'could' (past modal) to maintain the polite, tentative tone."
    },
    {
      incorrect: "If I was the CEO, I would change the policy immediately.",
      correct: "If I were the CEO, I would change the policy immediately.",
      explanation: "In second conditional and hypothetical 'if' clauses, 'were' is used instead of 'was' for all subjects."
    },
    {
      incorrect: "The manager said that the report is submitted already.",
      correct: "The manager said that the report had been submitted already.",
      explanation: "When the reporting verb is past ('said'), shift the tense back: present simple → past perfect."
    },
    {
      incorrect: "The contracts are being signed by the client tomorrow.",
      correct: "The contracts will be signed by the client tomorrow.",
      explanation: "For a future action, use future passive ('will be signed') rather than present continuous passive."
    }
  ],
  sentenceTransformation: [
    {
      prompt: "We might not meet the deadline if we don't work overtime.",
      startWith: "Unless",
      correct: ["Unless we work overtime, we might not meet the deadline.", "Unless we work overtime, we may not meet the deadline."],
      hint: "Start with 'Unless' — this replaces 'if … not'.",
      explanation: "'Unless' introduces a condition that must be met; it replaces 'if … not'."
    },
    {
      prompt: "The client said, 'We have not received the invoice yet.'",
      startWith: "The client said that",
      correct: ["The client said that they had not received the invoice yet.", "The client said that the company had not received the invoice yet."],
      hint: "Shift present perfect to past perfect in reported speech.",
      explanation: "When converting direct speech to reported speech with a past reporting verb, 'have not received' becomes 'had not received'."
    },
    {
      prompt: "It is very probable that sales will grow next quarter.",
      startWith: "Sales are",
      correct: ["Sales are bound to grow next quarter.", "Sales are bound to increase next quarter."],
      hint: "Use an expression of certainty with 'bound'.",
      explanation: "'Bound to' expresses strong certainty, equivalent to 'very probable'."
    },
    {
      prompt: "Someone will review the application before the interview.",
      startWith: "The application",
      correct: ["The application will be reviewed before the interview."],
      hint: "Start with the object of the action — use passive voice.",
      explanation: "The active subject ('someone') is unknown or unimportant; passive voice focuses on the application."
    }
  ],
  clozePassage: {
    text: "In last month's meeting, the team discussed the declining profit margins. It {0} that the rising cost of raw materials {1} our bottom line for several quarters. The CFO said that the situation {2} unless we renegotiate supplier contracts. If we {3} to secure better rates, we {4} be able to restore margins by Q2. A new pricing strategy {5} introduced next month, and all clients {6} informed in writing.",
    blanks: [
      {
        correct: "was reported",
        options: ["reported", "was reported", "has reported", "is reporting"],
        explanation: "Passive voice (past simple): 'It was reported that …'"
      },
      {
        correct: "had been affecting",
        options: ["affected", "has affected", "had been affecting", "was affecting"],
        explanation: "Past perfect continuous shows an action that had been ongoing before another past event."
      },
      {
        correct: "would not improve",
        options: ["will not improve", "would not improve", "does not improve", "had not improved"],
        explanation: "In reported speech, 'will' shifts to 'would' and simple present shifts to a conditional form."
      },
      {
        correct: "managed",
        options: ["manage", "managed", "would manage", "had managed"],
        explanation: "Second conditional 'if' clause requires past simple: 'If we managed …'"
      },
      {
        correct: "would",
        options: ["will", "would", "are", "were"],
        explanation: "Second conditional main clause: 'would + base verb'."
      },
      {
        correct: "will be",
        options: ["is", "will be", "has been", "would be"],
        explanation: "Future passive: 'will be introduced' — the strategy is the recipient of the action."
      },
      {
        correct: "will be",
        options: ["are", "will be", "were", "have been"],
        explanation: "Future passive: 'will be informed' refers to an action that will happen to the clients."
      }
    ]
  }
};
