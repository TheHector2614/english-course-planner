export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What is the main purpose of technical documentation?",
        options: [
          "To make the code run faster",
          "To explain how software works and how to use it",
          "To replace automated testing",
          "To increase the project file size",
        ],
        correct: 1,
        explanation:
          "Technical documentation helps users and developers understand the software's functionality and usage.",
      },
      {
        id: 2,
        question: "Which sentence best describes a CI/CD pipeline?",
        options: [
          "It is a manual process for deploying code",
          "It automates building, testing, and deploying code",
          "It only runs unit tests on local machines",
          "It replaces the need for version control",
        ],
        correct: 1,
        explanation:
          "A CI/CD pipeline automates the build, test, and deployment stages of software delivery.",
      },
      {
        id: 3,
        question: "During a code review, what should you focus on?",
        options: [
          "Only the formatting of the code",
          "Logic, security, performance, and readability",
          "Making as many comments as possible",
          "Changing variable names to shorter ones",
        ],
        correct: 1,
        explanation:
          "Code reviews should evaluate logic, security, performance, and readability — not just style.",
      },
      {
        id: 4,
        question: "What is a sprint retrospective in agile?",
        options: [
          "A meeting to plan the next sprint's tasks",
          "A meeting to discuss what went well and what could be improved",
          "A daily stand-up meeting for status updates",
          "A demo where the team shows completed features",
        ],
        correct: 1,
        explanation:
          "A retrospective is held at the end of a sprint to reflect on the process and identify improvements.",
      },
      {
        id: 5,
        question: "Which is the most effective way to report a bug?",
        options: [
          '"It doesn\'t work. Fix it."',
          '"Steps to reproduce, expected result, and actual result with screenshots"',
          '"The app is broken — please fix asap"',
          '"Someone broke the login page again"',
        ],
        correct: 1,
        explanation:
          "A good bug report includes clear steps to reproduce, expected vs actual behavior, and supporting evidence.",
      },
      {
        id: 6,
        question: "When comparing technologies, which factors should you consider?",
        options: [
          "Only the popularity of each technology",
          "Performance, scalability, community, learning curve, and use case",
          "Which one has the most appealing logo",
          "Only the licensing cost",
        ],
        correct: 1,
        explanation:
          "Technology comparisons should evaluate multiple dimensions: performance, scalability, community, learning curve, and fit for the use case.",
      },
      {
        id: 7,
        question:
          "If we _____ the architecture, scalability would improve significantly.",
        options: ["would redesign", "redesigned", "had redesigned", "will redesign"],
        correct: 1,
        explanation:
          "Second conditional uses 'if + past simple, would + base verb' for hypothetical present/future situations.",
      },
      {
        id: 8,
        question:
          "The deployment _____ by the DevOps engineer every Friday afternoon.",
        options: [
          "is being handled",
          "handles",
          "is handling",
          "has handled",
        ],
        correct: 0,
        explanation:
          "Present continuous passive is formed with 'is/are/am + being + past participle'.",
      },
    ],
  },

  flashcards: [
    {
      front: "CI/CD",
      back: "Continuous Integration / Continuous Deployment",
      example:
        "We set up a CI/CD pipeline to automate our testing and deployment process.",
    },
    {
      front: "refactoring",
      back: "Restructuring existing code without changing its external behavior",
      example:
        "Refactoring the legacy module improved its readability and maintainability.",
    },
    {
      front: "sprint",
      back: "A fixed time period for completing work in agile development",
      example: "We completed three user stories during this two-week sprint.",
    },
    {
      front: "architecture",
      back: "The high-level structure and design of a software system",
      example:
        "The microservices architecture improved the system's scalability and fault tolerance.",
    },
    {
      front: "deploy",
      back: "To release software to a production environment for users",
      example: "They deploy new features to production every two weeks.",
    },
    {
      front: "repository",
      back: "A central location where version-controlled code is stored",
      example:
        "Push your changes to the remote repository once the code review is approved.",
    },
    {
      front: "stakeholder",
      back: "A person or group with an interest in the project's outcome",
      example:
        "We demonstrated the new dashboard to the stakeholders during the sprint review.",
    },
    {
      front: "regression",
      back: "A bug that reappears after a previously working feature was changed",
      example:
        "The update caused a regression in the authentication module that we had to fix urgently.",
    },
  ],

  fillBlank: [
    {
      sentence:
        "If the server _____ down, we would lose all unsaved data immediately.",
      answer: "went",
      options: ["goes", "went", "had gone", "would go"],
      explanation:
        "Second conditional uses 'if + past simple' for hypothetical situations.",
    },
    {
      sentence:
        "The team has been _____ on the new API documentation since last month.",
      answer: "working",
      options: ["worked", "working", "works", "work"],
      explanation:
        "Present perfect continuous is formed with 'has/have been + present participle'.",
    },
    {
      sentence:
        "The bug report stated that the error _____ caused by a missing configuration file.",
      answer: "was",
      options: ["is", "was", "has been", "will be"],
      explanation:
        "Reported speech shifts the present tense back to the past tense.",
    },
    {
      sentence:
        "Automated tests _____ run every time a new commit is pushed to the main branch.",
      answer: "are",
      options: ["are", "were", "have been", "will be"],
      explanation:
        "Present simple passive is formed with 'is/are + past participle'.",
    },
    {
      sentence:
        "She said that she _____ the code review before the deadline.",
      answer: "had finished",
      options: [
        "finishes",
        "finished",
        "had finished",
        "has finished",
      ],
      explanation:
        "Reported speech uses past perfect to refer to an action completed before another past event.",
    },
  ],

  matchPairs: [
    {
      left: "Sprint planning",
      right: "A meeting to decide what work will be done in the next sprint",
    },
    {
      left: "Code review",
      right: "A process where team members examine code for issues and improvements",
    },
    {
      left: "Bug report",
      right: "A document describing a software defect with steps to reproduce it",
    },
    {
      left: "Technical demo",
      right: "A presentation showing how a feature or system works to stakeholders",
    },
    {
      left: "Repository",
      right: "A central location for storing and managing version-controlled code",
    },
    {
      left: "CI/CD pipeline",
      right: "An automated sequence of build, test, and deploy stages",
    },
  ],

  reorder: [
    {
      words: ["we", "If", "more", "deploy", "would", "tests", "the", "we", "confidently", "wrote", "more"],
      correct: "If we wrote more tests, we would deploy more confidently.",
    },
    {
      words: ["been", "has", "The", "team", "on", "working", "this", "feature", "new", "for", "weeks", "two"],
      correct: "The team has been working on this new feature for two weeks.",
    },
    {
      words: ["reviewed", "The", "be", "must", "code", "before", "it", "deployed", "is"],
      correct: "The code must be reviewed before it is deployed.",
    },
    {
      words: ["said", "He", "that", "bug", "the", "been", "had", "fixed"],
      correct: "He said that the bug had been fixed.",
    },
    {
      words: ["architecture", "The", "is", "new", "being", "designed", "by", "team", "the"],
      correct: "The new architecture is being designed by the team.",
    },
  ],

  speaking: [
    {
      text: "Continuous integration has been running smoothly since the update.",
      phonetic:
        "/kənˈtɪnjuəs ˌɪntɪˈɡreɪʃən hæz bɪn ˈrʌnɪŋ ˈsmuːðli sɪns ði ʌpˈdeɪt/",
    },
    {
      text: "The system architecture was redesigned last quarter.",
      phonetic:
        "/ðə ˈsɪstəm ˈɑːkɪtektʃə wɒz ˌriːdɪˈzaɪnd lɑːst ˈkwɔːtə/",
    },
    {
      text: "If we improved our test coverage, deployment would be safer.",
      phonetic:
        "/ɪf wiː ɪmˈpruːvd aʊə test ˈkʌvərɪdʒ, dɪˈplɔɪmənt wʊd biː ˈseɪfə/",
    },
    {
      text: "She reported that the production bug had been resolved.",
      phonetic:
        "/ʃiː rɪˈpɔːtɪd ðæt ðə prəˈdʌkʃən bʌɡ hæd biːn rɪˈzɒlvd/",
    },
    {
      text: "The documentation team has been working on the API guide.",
      phonetic:
        "/ðə ˌdɒkjʊmenˈteɪʃən tiːm hæz bɪn ˈwɜːkɪŋ ɒn ði ˌeɪpiːˈaɪ ɡaɪd/",
    },
  ],

  dictation: [
    {
      text: "The technical documentation has been updated by the frontend team.",
    },
    {
      text: "A sprint retrospective is held after every iteration.",
    },
    {
      text: "The bug report included clear steps to reproduce the issue.",
    },
    {
      text: "If we restructured the database, queries would run much faster.",
    },
    {
      text: "He explained that the architecture had been designed for scalability.",
    },
  ],

  listening: [
    {
      text: "During the sprint retrospective, the team discussed what had worked well and what needed improvement. They agreed to shorten their daily stand-ups and start pairing on complex tasks.",
      question: "What did the team agree to do during the retrospective?",
      options: [
        "Cancel daily stand-ups entirely",
        "Shorten daily stand-up meetings",
        "Extend the sprint duration",
        "Skip the next retrospective",
      ],
      correct: 1,
    },
    {
      text: "The CI/CD pipeline has been failing since Monday morning. The DevOps team has been investigating the issue all week. If they had tested the configuration earlier, the problem would have been avoided entirely.",
      question: "When did the CI/CD pipeline start failing?",
      options: [
        "Last week",
        "On Monday morning",
        "On Friday afternoon",
        "Yesterday",
      ],
      correct: 1,
    },
    {
      text: "When you are writing technical documentation, remember that it is being read by different audiences. End users need simple step-by-step instructions, while developers need detailed API references and code examples. If you write with both audiences in mind, your documentation will be far more effective.",
      question: "According to the speaker, who reads technical documentation?",
      options: [
        "Only software developers",
        "Only end users",
        "Both end users and developers",
        "Only project managers",
      ],
      correct: 2,
    },
  ],

  errorCorrection: [
    {
      incorrect:
        "If I would have more time, I would refactor the legacy module.",
      correct:
        "If I had more time, I would refactor the legacy module.",
      explanation:
        "Second conditional uses 'if + past simple', not 'if + would'. The correct form is 'If I had... I would...'",
    },
    {
      incorrect: "He said that the deployment is completed on Friday.",
      correct:
        "He said that the deployment was completed on Friday.",
      explanation:
        "In reported speech, the present tense ('is') shifts back to the past tense ('was').",
    },
    {
      incorrect:
        "The new feature has been develop by the frontend team.",
      correct:
        "The new feature has been developed by the frontend team.",
      explanation:
        "Present perfect passive requires the past participle form: 'has been + past participle'.",
    },
    {
      incorrect: "The API is being test by the QA team right now.",
      correct:
        "The API is being tested by the QA team right now.",
      explanation:
        "The passive continuous construction 'is being' must be followed by a past participle.",
    },
  ],

  sentenceTransformation: [
    {
      prompt:
        "We didn't write enough tests, so the deployment failed.",
      startWith: "If",
      correct: [
        "If we had written enough tests, the deployment would not have failed.",
        "If we had written more tests, the deployment would not have failed.",
      ],
      hint: "Use the third conditional.",
      explanation:
        "Third conditional: 'If + past perfect, would have + past participle' for unreal past situations.",
    },
    {
      prompt: "The team is redesigning the system architecture.",
      startWith: "The system architecture",
      correct: [
        "The system architecture is being redesigned by the team.",
      ],
      hint: "Use present continuous passive.",
      explanation:
        "Present continuous passive: 'is/are + being + past participle'.",
    },
    {
      prompt: "\"We have completed the code review,\" said Maria.",
      startWith: "Maria said",
      correct: [
        "Maria said that they had completed the code review.",
        "Maria said they had completed the code review.",
      ],
      hint: "Use reported speech.",
      explanation:
        "In reported speech, present perfect ('have completed') shifts to past perfect ('had completed').",
    },
    {
      prompt:
        "We started working on the documentation two months ago and we are still working on it.",
      startWith: "The team",
      correct: [
        "The team has been working on the documentation for two months.",
      ],
      hint: "Use present perfect continuous.",
      explanation:
        "Present perfect continuous: 'has/have + been + present participle' for actions that started in the past and continue.",
    },
  ],

  clozePassage: null
};
