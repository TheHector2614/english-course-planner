export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What does BATNA stand for in negotiation strategy?",
        options: [
          "Best Alternative to a Negotiated Agreement",
          "Basic Agreement Terms and Negotiated Addenda",
          "Balanced Assessment of Trade-off Needs and Assets",
          "Binding Arbitration for Transnational Negotiation Agreements",
        ],
        correct: 0,
        explanation:
          "BATNA (Best Alternative to a Negotiated Agreement) is your fallback if negotiations fail. Knowing your BATNA strengthens your bargaining position.",
      },
      {
        id: 2,
        question: "Which sentence correctly uses inversion for emphasis?",
        options: [
          "Not only did sales increase, but customer satisfaction also improved.",
          "Not only sales increased, but customer satisfaction also improved.",
          "Not only did sales increase, but also did customer satisfaction improve.",
          "Not only sales did increase, but customer satisfaction also improved.",
        ],
        correct: 0,
        explanation:
          "Inversion after 'Not only' requires an auxiliary verb before the subject: 'Not only did sales increase...'",
      },
      {
        id: 3,
        question: "Which mixed conditional is correct for a past action affecting the present?",
        options: [
          "If we had invested in AI earlier, we would be market leaders now.",
          "If we would have invested in AI earlier, we would be market leaders now.",
          "If we invested in AI earlier, we would be market leaders now.",
          "If we had invested in AI earlier, we would have been market leaders now.",
        ],
        correct: 0,
        explanation:
          "Mixed conditional (3rd + 2nd): 'If + had + past participle' (past condition) + 'would + base verb' (present result).",
      },
      {
        id: 4,
        question: "What is the primary purpose of hedging in formal business communication?",
        options: [
          "To express certainty and authority",
          "To soften claims and reduce commitment to absolute statements",
          "To shorten sentences for efficiency",
          "To obscure the speaker's true position",
        ],
        correct: 1,
        explanation:
          "Hedging uses tentative language (e.g., 'It could be argued that...') to sound diplomatic and avoid overstatement.",
      },
      {
        id: 5,
        question: "Which phrase is most appropriate when handling a customer complaint?",
        options: [
          "You clearly misunderstood the terms.",
          "I appreciate you bringing this to our attention.",
          "That's not our problem.",
          "Let me check the policy — you might be wrong.",
        ],
        correct: 1,
        explanation:
          "Acknowledging the customer's concern empathetically de-escalates tension and builds trust.",
      },
      {
        id: 6,
        question: "Which rhetorical device is most effective in a persuasive presentation opening?",
        options: [
          "A rhetorical question that challenges assumptions",
          "A lengthy disclaimer about data limitations",
          "A detailed breakdown of quarterly expenses",
          "A reminder about fire exit locations",
        ],
        correct: 0,
        explanation:
          "Rhetorical questions engage the audience immediately and frame the central problem the presentation will address.",
      },
      {
        id: 7,
        question: "Which modal perfect expresses regret about a missed business opportunity?",
        options: [
          "We should have entered that market before the competitor.",
          "We must enter that market before the competitor.",
          "We could enter that market before the competitor.",
          "We will have entered that market before the competitor.",
        ],
        correct: 0,
        explanation:
          "'Should have + past participle' expresses a past action that was advisable but did not happen — ideal for expressing regret.",
      },
      {
        id: 8,
        question: "Which sentence uses a cleft structure for emphasis?",
        options: [
          "It was the lack of R&D funding that caused the decline.",
          "The lack of R&D funding caused the decline.",
          "Because there was a lack of R&D funding, there was a decline.",
          "The decline was caused by lack of R&D funding.",
        ],
        correct: 0,
        explanation:
          "Cleft sentence: 'It + be + emphasised element + that/who...' Front-loads the key information for impact.",
      },
    ],
  },

  flashcards: [
    {
      front: "BATNA",
      back: "Best Alternative to a Negotiated Agreement",
      example: "Before the meeting, we calculated our BATNA to ensure we wouldn't accept an unfavorable deal.",
    },
    {
      front: "win-win outcome",
      back: "A negotiation result where all parties benefit",
      example: "We structured the joint venture as a win-win outcome so both companies share the upside.",
    },
    {
      front: "trade-off",
      back: "A concession made in exchange for another advantage",
      example: "The trade-off for faster delivery was a 10% increase in unit cost.",
    },
    {
      front: "rhetorical question",
      back: "A question asked for effect rather than an answer",
      example: "'How can we afford to ignore this opportunity?' is a rhetorical question that challenges inaction.",
    },
    {
      front: "hedging",
      back: "Using cautious language to avoid absolute claims",
      example: "It could be argued that market conditions are improving, though the data is still inconclusive.",
    },
    {
      front: "inversion",
      back: "Reversing normal word order for emphasis",
      example: "Not only has our revenue doubled, but we have also expanded into three new regions.",
    },
    {
      front: "mixed conditional",
      back: "A conditional combining a past condition with a present result",
      example: "If we had secured that patent, we would dominate the market today.",
    },
    {
      front: "cleft sentence",
      back: "A sentence split to emphasise one element",
      example: "What we need is a complete restructuring of the supply chain.",
    },
  ],

  fillBlank: [
    {
      sentence: "It could be ___ that our pricing strategy needs recalibration, though the evidence is mixed.",
      answer: "argued",
      options: ["argued", "argue", "arguing", "argument"],
      explanation: "Modal passive: 'could be + past participle' (argued) is a hedging structure.",
    },
    {
      sentence: "If we ___ the merger last year, we wouldn't be struggling for market share now.",
      answer: "had pursued",
      options: ["pursued", "had pursued", "would pursue", "were pursuing"],
      explanation: "Mixed conditional: 'If + had + past participle' for the past condition.",
    },
    {
      sentence: "Not only ___ the company exceed its targets, but it also reduced overhead costs.",
      answer: "did",
      options: ["did", "has", "had", "does"],
      explanation: "Inversion with 'Not only' requires an auxiliary verb before the subject: 'did the company exceed'.",
    },
    {
      sentence: "We ___ have diversified our portfolio before the downturn hit.",
      answer: "should",
      options: ["must", "should", "could", "might"],
      explanation: "'Should have + past participle' expresses a missed advisable action — a common regret in business.",
    },
    {
      sentence: "What the board ___ is a clear roadmap for digital transformation.",
      answer: "needs",
      options: ["need", "needs", "needed", "needing"],
      explanation: "Cleft sentence with 'What': 'What + subject + verb + is...' — verb agrees with the subject (the board, singular).",
    },
  ],

  matchPairs: [
    { left: "BATNA", right: "Fallback option if negotiation fails" },
    { left: "Trade-off", right: "Sacrificing one benefit for another" },
    { left: "Rhetorical question", right: "A question meant to provoke thought, not an answer" },
    { left: "Hedging", right: "Cautious language to soften claims" },
    { left: "Cleft sentence", right: "Structure that front-loads emphasis" },
    { left: "Mixed conditional", right: "Past condition with present result" },
  ],

  reorder: [
    {
      words: ["only", "did", "increase", "sales", "our", "revenue", "double", "not", "but"],
      correct: "Not only did our sales double but revenue also increase",
    },
    {
      words: ["had", "invested", "we", "if", "automation", "in", "would", "we", "competitive", "be", "more"],
      correct: "If we had invested in automation we would be more competitive",
    },
    {
      words: ["was", "it", "the", "that", "strategy", "flawed", "pricing", "caused", "the", "decline"],
      correct: "It was the flawed pricing strategy that caused the decline",
    },
    {
      words: ["should", "launched", "we", "product", "the", "earlier", "have"],
      correct: "We should have launched the product earlier",
    },
    {
      words: ["argued", "it", "be", "could", "market", "that", "the", "recovering", "is"],
      correct: "It could be argued that the market is recovering",
    },
  ],

  speaking: [
    {
      text: "We should have diversified our investment portfolio earlier.",
      phonetic: "/wiː ˈʃʊd həv daɪˈvɜːsɪfaɪd ˈaʊər ɪnˈvestmənt pɔːtˈfəʊlioʊ ˈɜːliər/",
    },
    {
      text: "Not only did the campaign boost brand awareness, but it also increased sales by 30%.",
      phonetic: "/nɒt ˈəʊnli dɪd ðə kæmˈpeɪn buːst brænd əˈweənəs bʌt ɪt ˈɔːlsəʊ ˈɪnkriːst seɪlz baɪ ˈθɜːti pəˈsent/",
    },
    {
      text: "If we had secured the patent, we would be leading the market today.",
      phonetic: "/ɪf wiː hæd sɪˈkjʊəd ðə ˈpeɪtənt wiː wʊd biː ˈliːdɪŋ ðə ˈmɑːkɪt təˈdeɪ/",
    },
    {
      text: "It could be argued that our supply chain needs restructuring.",
      phonetic: "/ɪt kʊd biː ˈɑːɡjuːd ðæt ˈaʊər səˈplaɪ tʃeɪn niːdz ˌriːˈstrʌktʃərɪŋ/",
    },
    {
      text: "What we truly need is a fundamental shift in corporate culture.",
      phonetic: "/wɒt wiː ˈtruːli niːd ɪz ə ˌfʌndəˈmentl ʃɪft ɪn ˈkɔːpərət ˈkʌltʃər/",
    },
  ],

  dictation: [
    {
      text: "We should have negotiated harder on the payment terms.",
    },
    {
      text: "Not only has the brand grown, but customer loyalty has also strengthened.",
    },
    {
      text: "If we had adopted agile methodology sooner, we would be delivering faster now.",
    },
    {
      text: "It was the lack of transparency that eroded stakeholder trust.",
    },
    {
      text: "What the market needs is a more sustainable packaging solution.",
    },
  ],

  listening: [
    {
      text: "Right, let me outline our position. Had we entered that market two years earlier, we would now hold a dominant share. The window hasn't closed completely, but our BATNA suggests an alternative partnership might yield better returns with lower risk.",
      question: "What is the speaker's main point about the market opportunity?",
      options: [
        "The window has closed completely",
        "Entering earlier would have led to dominance, but a partnership may now be a better option",
        "The market is not worth pursuing at all",
        "Dominant market share is guaranteed",
      ],
      correct: 1,
    },
    {
      text: "I appreciate you raising this issue. Let me assure you that we take quality concerns seriously. Had our QA team flagged this batch, it would never have left the warehouse. We are implementing additional inspection protocols immediately.",
      question: "How does the speaker handle the complaint?",
      options: [
        "They deny responsibility entirely",
        "They acknowledge the concern, explain the oversight, and present corrective action",
        "They blame the QA team",
        "They suggest the customer is mistaken",
      ],
      correct: 1,
    },
    {
      text: "It could be argued that our current pricing model is outdated, but a price increase risks alienating our core demographic. What we should do is segment our offering — premium tier for high-value clients, standard tier for the mass market.",
      question: "What solution does the speaker propose?",
      options: [
        "Keeping the current pricing model unchanged",
        "Increasing prices across all segments",
        "Creating a segmented pricing structure with premium and standard tiers",
        "Focusing only on high-value clients",
      ],
      correct: 2,
    },
  ],

  errorCorrection: [
    {
      incorrect: "Not only the sales increased, but also the profits grew.",
      correct: "Not only did the sales increase, but the profits also grew.",
      explanation: "Inversion requires an auxiliary verb before the subject: 'Not only did the sales increase...'",
    },
    {
      incorrect: "If we would have launched earlier, we would dominate the market now.",
      correct: "If we had launched earlier, we would dominate the market now.",
      explanation: "In mixed conditionals, the if-clause uses 'had + past participle', not 'would have'.",
    },
    {
      incorrect: "It could be argue that the strategy is flawed.",
      correct: "It could be argued that the strategy is flawed.",
      explanation: "Hedging with 'could be' requires the past participle: 'argued', not base form.",
    },
    {
      incorrect: "What the management need is a clear action plan.",
      correct: "What the management needs is a clear action plan.",
      explanation: "In a cleft sentence with 'What', the verb agrees with the subject ('management' is singular in this context).",
    },
  ],

  sentenceTransformation: [
    {
      prompt: "The marketing team failed to research the audience, so the campaign underperformed.",
      startWith: "If the marketing team",
      correct: [
        "If the marketing team had researched the audience, the campaign would not have underperformed",
        "If the marketing team had researched the audience, it would not have underperformed",
      ],
      hint: "Use a third conditional (past unreal condition + past unreal result).",
      explanation:
        "Third conditional: 'If + had + past participle, would + have + past participle' for unreal past situations.",
    },
    {
      prompt: "The company failed to innovate years ago, which is why it is losing market share now.",
      startWith: "If the company",
      correct: [
        "If the company had innovated years ago, it would not be losing market share now",
      ],
      hint: "Use a mixed conditional (past condition + present result).",
      explanation:
        "Mixed conditional: 'If + had + past participle' (past) + 'would + base verb' (present result).",
    },
    {
      prompt: "Sales increased dramatically, and customer retention also improved.",
      startWith: "Not only",
      correct: [
        "Not only did sales increase dramatically, but customer retention also improved",
        "Not only did sales increase dramatically, but also customer retention improved",
      ],
      hint: "Use inversion with 'Not only' at the beginning.",
      explanation:
        "Inversion: 'Not only + auxiliary + subject + verb... but... also...'",
    },
    {
      prompt: "The poor logistics strategy caused the delays.",
      startWith: "It",
      correct: [
        "It was the poor logistics strategy that caused the delays",
      ],
      hint: "Use a cleft sentence starting with 'It'.",
      explanation:
        "Cleft sentence: 'It + be + emphasised element + that + rest of sentence'.",
    },
  ],

  clozePassage: {
    text: "In any complex {0}, knowing your {1} is the first rule of effective bargaining. Negotiators must identify which terms are negotiable and which are non-negotiable, and be prepared to make strategic {2}. Not only {3} strong preparation improve outcomes, but it also builds credibility. If parties {4} invested more time in understanding each other's constraints, they would reach mutually beneficial agreements far more often. It could be {5} that the most overlooked skill in business negotiations is active listening — yet {6} truly sets expert negotiators apart {7} the ability to ask the right questions.",
    blanks: [
      {
        correct: "negotiation",
        options: ["negotiation", "negotiate", "negotiating", "negotiator"],
        explanation: "Noun form needed after 'complex'.",
      },
      {
        correct: "BATNA",
        options: ["BATNA", "budget", "proposal", "deadline"],
        explanation: "Best Alternative to a Negotiated Agreement — a key negotiation concept.",
      },
      {
        correct: "trade-offs",
        options: ["trade-offs", "trade-off", "trade-off's", "trade-offing"],
        explanation: "Plural noun: strategic concessions made in exchange for advantages.",
      },
      {
        correct: "does",
        options: ["does", "did", "has", "had"],
        explanation: "Inversion after 'Not only' requires auxiliary 'does' for the present simple verb 'improve'.",
      },
      {
        correct: "invested",
        options: ["invest", "invested", "would invest", "were investing"],
        explanation: "Mixed conditional: 'If + had + past participle' for the past condition.",
      },
      {
        correct: "argued",
        options: ["argue", "argued", "arguing", "argument"],
        explanation: "Hedging: 'could be + past participle' (argued).",
      },
      {
        correct: "what",
        options: ["what", "that", "it", "which"],
        explanation: "Cleft structure with 'what' — 'What truly sets expert negotiators apart is...'",
      },
      {
        correct: "is",
        options: ["is", "are", "was", "were"],
        explanation: "Singular verb 'is' agrees with 'what' as the subject in the cleft sentence.",
      },
    ],
  },
};
