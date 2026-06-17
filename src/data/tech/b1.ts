export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What does a developer mean when they say: 'The system crashes when we load the dashboard'?",
        options: [
          "The dashboard is loading slowly",
          "The application stops working unexpectedly",
          "The dashboard needs a design update",
          "The system is under maintenance"
        ],
        correct: 1,
        explanation: "'Crashes' means the application stops working unexpectedly, often with an error."
      },
      {
        id: 2,
        question: "Which sentence correctly describes a daily standup meeting?",
        options: [
          "We review all the code from the last month",
          "Each team member shares what they did yesterday and what they will do today",
          "The product manager presents the yearly roadmap",
          "We deploy the application to production"
        ],
        correct: 1,
        explanation: "A standup is a short daily meeting where team members share updates on what they did yesterday and plan for today."
      },
      {
        id: 3,
        question: "What does it mean to 'refactor' code?",
        options: [
          "Delete the code and start over",
          "Copy the code to another project",
          "Restructure existing code without changing its behavior",
          "Run tests on the code"
        ],
        correct: 2,
        explanation: "Refactoring means restructuring code to improve its readability or maintainability without changing what it does."
      },
      {
        id: 4,
        question: "Which modal verb is correct? 'You ___ restart the server before the changes take effect.'",
        options: [
          "can",
          "must",
          "might",
          "could"
        ],
        correct: 1,
        explanation: "'Must' expresses necessity — it is required to restart the server for the changes to work."
      },
      {
        id: 5,
        question: "What is a 'sprint' in Scrum?",
        options: [
          "A race between development teams",
          "A fixed time period during which specific work must be completed",
          "A quick meeting to solve urgent bugs",
          "A document listing all project requirements"
        ],
        correct: 1,
        explanation: "A sprint is a time-boxed period (usually 1–4 weeks) during which a team completes a set amount of work."
      },
      {
        id: 6,
        question: "Choose the sentence with correct passive voice:",
        options: [
          "The bug fixed by the developer yesterday",
          "The bug was fixed by the developer yesterday",
          "The developer fixed the bug yesterday",
          "The developer has fixed the bug yesterday"
        ],
        correct: 1,
        explanation: "Passive voice requires a form of 'to be' + past participle. 'Was fixed' is the correct passive form here."
      },
      {
        id: 7,
        question: "What does an API do?",
        options: [
          "It designs user interfaces",
          "It allows different software applications to communicate with each other",
          "It compiles source code into machine code",
          "It manages user passwords"
        ],
        correct: 1,
        explanation: "API (Application Programming Interface) enables different software systems to communicate and exchange data."
      },
      {
        id: 8,
        question: "Which sentence uses the present perfect correctly?",
        options: [
          "We already deployed the new version yesterday",
          "We have already deployed the new version",
          "We have already deployed the new version last week",
          "We already deploy the new version"
        ],
        correct: 1,
        explanation: "Present perfect ('have deployed') is used for past actions with present relevance, without a specific past time marker."
      }
    ]
  },

  flashcards: [
    {
      front: "crash",
      back: "to stop working suddenly",
      example: "The application crashes every time I try to upload a file."
    },
    {
      front: "sprint",
      back: "a fixed time period for completing work in Scrum",
      example: "Our team has two-week sprints, and we completed all tickets by the end of this one."
    },
    {
      front: "backlog",
      back: "a list of tasks or features to be completed",
      example: "The product owner added three new items to the backlog this morning."
    },
    {
      front: "standup",
      back: "a short daily meeting to share updates",
      example: "During the standup, I said I was working on the login bug."
    },
    {
      front: "refactor",
      back: "to restructure code without changing its behaviour",
      example: "We should refactor this module — it's becoming hard to maintain."
    },
    {
      front: "ticket",
      back: "a task or issue tracked in a project management system",
      example: "I created a ticket for the database connection error."
    },
    {
      front: "deploy",
      back: "to release software to a server or environment",
      example: "The new feature will be deployed to production on Friday."
    },
    {
      front: "endpoint",
      back: "a specific URL where an API can be accessed",
      example: "The user data is available at the /users API endpoint."
    }
  ],

  fillBlank: [
    {
      sentence: "If you save the file again, the system ___ overwrite the existing version.",
      answer: "will",
      options: ["will", "must", "has", "would"],
      explanation: "The first conditional uses 'will' in the result clause: 'If + present simple, will + base verb'."
    },
    {
      sentence: "The database ___ updated every night at midnight.",
      answer: "is",
      options: ["has", "is", "was", "will"],
      explanation: "Passive voice in present simple: subject + 'is' + past participle."
    },
    {
      sentence: "They ___ already deployed the hotfix to production.",
      answer: "have",
      options: ["have", "has", "are", "did"],
      explanation: "Present perfect uses 'have' with plural subjects: 'They have deployed'."
    },
    {
      sentence: "A ticket ___ be created for every bug found during testing.",
      answer: "should",
      options: ["must", "should", "can", "will"],
      explanation: "'Should' is used to give a recommendation or expected practice."
    },
    {
      sentence: "The developer said the issue ___ been resolved in the latest commit.",
      answer: "has",
      options: ["have", "has", "is", "was"],
      explanation: "Present perfect with a singular subject: 'the issue has been resolved'."
    }
  ],

  matchPairs: [
    { left: "Sprint", right: "A time-boxed period for completing work" },
    { left: "Backlog", right: "A prioritized list of pending tasks" },
    { left: "Standup", right: "A daily sync meeting" },
    { left: "API", right: "Lets applications communicate" },
    { left: "Repository", right: "Where source code is stored" },
    { left: "Endpoint", right: "A specific API URL" }
  ],

  reorder: [
    {
      words: ["system", "the", "unexpectedly", "crashes"],
      correct: "The system crashes unexpectedly."
    },
    {
      words: ["have", "fixed", "developers", "the", "already", "bug"],
      correct: "Developers have already fixed the bug."
    },
    {
      words: ["sprint", "every", "a", "standup", "hold", "we", "during"],
      correct: "We hold a standup every during a sprint."
    },
    {
      words: ["be", "code", "deployed", "must", "reviewed", "the", "before"],
      correct: "The code must be reviewed before deployed."
    },
    {
      words: ["refactored", "has", "the", "module", "been"],
      correct: "The module has been refactored."
    }
  ],

  speaking: [
    {
      text: "The system crashes when I click the submit button.",
      phonetic: "/ðə ˈsɪstəm ˈkræʃɪz wɛn aɪ klɪk ðə səbˈmɪt ˈbʌtən/"
    },
    {
      text: "We should refactor this function before the next sprint.",
      phonetic: "/wi ʃʊd riːˈfæktər ðɪs ˈfʌŋkʃən bɪˈfɔːr ðə nɛkst sprɪnt/"
    },
    {
      text: "The database connection has been lost.",
      phonetic: "/ðə ˈdeɪtəbeɪs kəˈnɛkʃən hæz bɪn lɒst/"
    },
    {
      text: "Have you reviewed the pull request yet?",
      phonetic: "/hæv juː rɪˈvjuːd ðə pʊl rɪˈkwɛst jɛt/"
    },
    {
      text: "This endpoint returns a JSON object.",
      phonetic: "/ðɪs ˈɛndpɔɪnt rɪˈtɜːrnz ə ˈdʒeɪsɒn ˈɒbdʒɪkt/"
    }
  ],

  dictation: [
    {
      text: "The server must be restarted after the update."
    },
    {
      text: "We have moved all user data to the new database."
    },
    {
      text: "A ticket has been created for the login issue."
    },
    {
      text: "If the tests pass, we will deploy to production."
    },
    {
      text: "The code review has been scheduled for tomorrow."
    }
  ],

  listening: [
    {
      text: "During the standup, Maria said she had fixed the authentication bug and would push her changes after lunch.",
      question: "What is Maria going to do after lunch?",
      options: [
        "Fix the authentication bug",
        "Push her changes",
        "Attend another meeting",
        "Review the backlog"
      ],
      correct: 1
    },
    {
      text: "The API endpoint has been updated. You can now send a GET request to /users to retrieve all active accounts. Authentication is required.",
      question: "What must you include when calling the new endpoint?",
      options: [
        "A POST request",
        "Authentication",
        "The list of active accounts",
        "A PUT request"
      ],
      correct: 1
    },
    {
      text: "If the build fails, we should check the logs first. The error might be related to a missing dependency in the configuration file.",
      question: "What might cause the build to fail according to the speaker?",
      options: [
        "A missing dependency",
        "A server crash",
        "A database timeout",
        "An incorrect endpoint"
      ],
      correct: 0
    }
  ],

  errorCorrection: [
    {
      incorrect: "The system has crash when I click the button.",
      correct: "The system crashes when I click the button.",
      explanation: "Present simple ('crashes') describes a recurring event. 'Has crash' is incorrect — 'has' requires a past participle ('has crashed')."
    },
    {
      incorrect: "We must to review the code before deploy.",
      correct: "We must review the code before deploying.",
      explanation: "'Must' is followed by the base form of the verb (no 'to'). 'Before' is a preposition followed by a gerund ('deploying')."
    },
    {
      incorrect: "The bug has been fixed by the developer yesterday.",
      correct: "The bug was fixed by the developer yesterday.",
      explanation: "Present perfect cannot be used with a specific past time marker ('yesterday'). Past simple passive is correct here."
    },
    {
      incorrect: "If we will deploy on Friday, we will need approval.",
      correct: "If we deploy on Friday, we will need approval.",
      explanation: "In first conditional, the 'if' clause uses present simple, not 'will'."
    }
  ],

  sentenceTransformation: [
    {
      prompt: "The team reviews every pull request before merging.",
      startWith: "Every pull request",
      correct: ["Every pull request is reviewed by the team before merging.", "Every pull request is reviewed before merging."],
      hint: "Change from active to passive voice. Start with 'Every pull request' and use 'is reviewed'.",
      explanation: "Active voice: subject (the team) → verb (reviews) → object (every pull request). In passive, the object becomes the subject."
    },
    {
      prompt: "The developer fixed the authentication bug last night.",
      startWith: "The authentication bug",
      correct: ["The authentication bug was fixed last night.", "The authentication bug was fixed by the developer last night."],
      hint: "Use passive voice in past simple. Start with 'The authentication bug'.",
      explanation: "The object of the active sentence ('the authentication bug') becomes the subject in the passive version."
    },
    {
      prompt: "It is necessary for you to restart the server.",
      startWith: "You must",
      correct: ["You must restart the server."],
      hint: "Replace 'It is necessary for you to' with a modal verb.",
      explanation: "'Must' expresses strong necessity and is more concise than 'It is necessary for ... to'."
    },
    {
      prompt: "We deployed the new version. Then we ran the tests.",
      startWith: "After we",
      correct: ["After we deployed the new version, we ran the tests.", "After we had deployed the new version, we ran the tests."],
      hint: "Join the two sentences using 'After'. The first action uses past simple or past perfect.",
      explanation: "'After' introduces the earlier action. Past perfect ('had deployed') can emphasize the order of past events."
    }
  ],

  clozePassage: null
};
