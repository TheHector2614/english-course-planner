export default {
  quiz: {
    questions: [
      {
        id: 1,
        question:
          "What is the primary advantage of a microservices architecture over a monolithic architecture?",
        options: [
          "Simpler deployment process",
          "Independent scalability of components",
          "Reduced network latency",
          "Lower operational costs",
        ],
        correct: 1,
        explanation:
          "Microservices allow each service to scale independently based on demand, whereas a monolith must scale as a single unit.",
      },
      {
        id: 2,
        question:
          "In a code review, which of the following is the best way to suggest an alternative approach?",
        options: [
          '"This is wrong. Do it my way instead."',
          '"Have you considered using a cache layer here? It might reduce latency."',
          '"Rewrite the whole module."',
          '"The current implementation is fine, so leave it."',
        ],
        correct: 1,
        explanation:
          "Framing suggestions as collaborative questions invites discussion and shows respect for the author's work.",
      },
      {
        id: 3,
        question:
          "When presenting a technical proposal to non-technical stakeholders, what should you prioritise?",
        options: [
          "Detailed algorithm complexity analysis",
          "Business value and expected outcomes",
          "The specific programming languages involved",
          "Low-level database schema changes",
        ],
        correct: 1,
        explanation:
          "Stakeholders care most about impact on cost, timeline, and business goals rather than implementation minutiae.",
      },
      {
        id: 4,
        question:
          "Which sentence uses inversion correctly to express a condition?",
        options: [
          "Had we tested the endpoint, we would have caught the bug earlier.",
          "We had tested the endpoint, we would have caught the bug earlier.",
          "Had we tested the endpoint, we will catch the bug earlier.",
          "We had tested the endpoint, we catch the bug earlier.",
        ],
        correct: 0,
        explanation:
          "Inversion removes 'if' and swaps subject and auxiliary: 'Had we tested' instead of 'If we had tested'.",
      },
      {
        id: 5,
        question:
          "What does 'eventual consistency' mean in a distributed system?",
        options: [
          "Data is always consistent across all nodes immediately",
          "The system will become consistent given enough time with no updates",
          "Consistency is guaranteed only during business hours",
          "Data never needs to be consistent",
        ],
        correct: 1,
        explanation:
          "Eventual consistency guarantees that if no new updates are made, all replicas will converge to the same value over time.",
      },
      {
        id: 6,
        question:
          "Which statement best describes a trade-off in RESTful API design?",
        options: [
          "Using nested resources always improves performance",
          "Versioning via URL paths can simplify routing but clutters the URI namespace",
          "POST requests are inherently more secure than GET requests",
          "JSON is always faster than Protocol Buffers",
        ],
        correct: 1,
        explanation:
          "URL-based versioning is explicit and easy to route, but it leads to duplicated code and polluted URI namespaces.",
      },
      {
        id: 7,
        question:
          'What is the most effective approach when mentoring a junior developer on debugging a production issue?',
        options: [
          "Fix the issue yourself and send them the solution",
          "Walk them through your thought process and let them drive the investigation",
          "Assign them a different task instead",
          "Have them read the entire codebase from scratch",
        ],
        correct: 1,
        explanation:
          "Guided discovery helps juniors build problem-solving skills and confidence without being left entirely on their own.",
      },
      {
        id: 8,
        question:
          "Which cleft sentence structure emphasises the subject most naturally?",
        options: [
          "It is the database query that is causing the bottleneck.",
          "The bottleneck is caused by the database query that it is.",
          "That the bottleneck is caused by the database query is.",
          "What the bottleneck is caused by is the database query that.",
        ],
        correct: 0,
        explanation:
          'The "It is ... that ..." cleft structure shifts focus to the subject, making the sentence emphatic and clear.',
      },
    ],
  },

  flashcards: [
    {
      front: "root cause analysis",
      back: "The process of identifying the underlying origin of a problem or fault",
      example:
        "We performed a root cause analysis after the outage and found a misconfigured load balancer.",
    },
    {
      front: "scalability",
      back: "The ability of a system to handle increased load by adding resources",
      example:
        "Horizontal scalability allows us to add more servers as traffic grows.",
    },
    {
      front: "technical debt",
      back: "The implied cost of additional rework caused by choosing an easy solution now instead of a better approach",
      example:
        "We need to refactor this module before the technical debt makes further changes impossible.",
    },
    {
      front: "deprecation",
      back: "The process of marking a feature as obsolete and advising against its use",
      example:
        "The legacy API endpoint has been marked for deprecation and will be removed in v3.",
    },
    {
      front: "throughput",
      back: "The amount of work or data processed by a system in a given amount of time",
      example:
        "The new caching layer improved throughput from 500 to 2,000 requests per second.",
    },
    {
      front: "idempotency",
      back: "The property that a request can be applied multiple times without changing the result beyond the first application",
      example:
        "Making the payment endpoint idempotent prevents duplicate charges if the client retries.",
    },
    {
      front: "onboarding",
      back: "The process of integrating a new team member into a project or organisation",
      example:
        "We streamlined the onboarding process with a comprehensive developer guide and pair-programming sessions.",
    },
    {
      front: "regression",
      back: "A software bug that reintroduces a previously fixed issue after a change is made",
      example:
        "We caught a regression in the authentication flow before it reached production.",
    },
  ],

  fillBlank: [
    {
      sentence:
        "If we {0} the load balancer earlier, the server wouldn't have gone down.",
      answer: "had reconfigured",
      options: ["had reconfigured", "reconfigured", "would reconfigure", "have reconfigured"],
      explanation:
        "Mixed third conditional: 'had + past participle' refers to an unreal past action affecting a past result.",
    },
    {
      sentence:
        "The system should have {0} the failover cluster before the maintenance window ended.",
      answer: "failed over to",
      options: ["failed over to", "fail over to", "failing over to", "fails over to"],
      explanation:
        "Modal perfect: 'should have + past participle' expresses an expected past action that did not happen.",
    },
    {
      sentence:
        "Not until the audit {0} we discover the misconfigured permissions.",
      answer: "did",
      options: ["did", "had", "was", "have"],
      explanation:
        "Inversion after 'Not until': the auxiliary 'did' is placed before the subject for emphasis.",
    },
    {
      sentence:
        "It was the caching layer that {0} the most significant performance improvement.",
      answer: "provided",
      options: ["provided", "provides", "had provide", "was provided"],
      explanation:
        "Cleft sentence: 'It was ... that ...' focuses on the caching layer; the verb agrees with the subject before 'that'.",
    },
    {
      sentence:
        "What the team {0} is a more rigorous code review process.",
      answer: "needs",
      options: ["needs", "needed", "is needing", "has been needing"],
      explanation:
        "Cleft sentence with 'What': the verb 'needs' agrees with the singular subject 'the team'.",
    },
  ],

  matchPairs: [
    { left: "Blue-Green Deployment", right: "A release strategy using two identical environments to minimise downtime" },
    { left: "Circuit Breaker", right: "A pattern that prevents cascading failures by stopping requests to a failing service" },
    { left: "Rate Limiting", right: "Controlling the number of requests a client can make within a window of time" },
    { left: "Sharding", right: "Partitioning a database across multiple servers to distribute load" },
    { left: "Sidecar Pattern", right: "Attaching a helper process to a primary application to offload cross-cutting concerns" },
    { left: "Backpressure", right: "A mechanism that regulates data flow to prevent a receiver from being overwhelmed" },
  ],

  reorder: [
    {
      words: ["Had", "the", "deployment", "been", "rolled", "back", "we", "would", "have", "prevented", "the", "downtime"],
      correct: "Had the deployment been rolled back, we would have prevented the downtime.",
    },
    {
      words: ["Not", "only", "does", "the", "new", "API", "reduce", "latency", "but", "it", "also", "improves", "throughput"],
      correct: "Not only does the new API reduce latency, but it also improves throughput.",
    },
    {
      words: ["It", "is", "the", "test", "suite", "that", "gives", "us", "confidence", "to", "deploy", "frequently"],
      correct: "It is the test suite that gives us confidence to deploy frequently.",
    },
    {
      words: ["Under", "no", "circumstances", "should", "you", "bypass", "the", "approval", "workflow"],
      correct: "Under no circumstances should you bypass the approval workflow.",
    },
    {
      words: ["What", "the", "architect", "proposed", "was", "a", "fully", "event-driven", "system"],
      correct: "What the architect proposed was a fully event-driven system.",
    },
  ],

  speaking: [
    {
      text: "The system should have failed over automatically.",
      phonetic: "/ðə ˈsɪstəm ʃʊd həv feɪld ˈoʊvər ˌɔːtəˈmætɪkli/",
    },
    {
      text: "Not until we analysed the logs did we realise the root cause.",
      phonetic: "/nɒt ənˈtɪl wiː ˈænəlaɪzd ðə lɒɡz dɪd wiː ˈrɪəlaɪz ðə ruːt kɔːz/",
    },
    {
      text: "Had we implemented the circuit breaker, the cascade would have been avoided.",
      phonetic: "/hæd wiː ˈɪmplɪmentɪd ðə ˈsɜːkɪt ˈbreɪkər ðə kæˈskeɪd wʊd həv biːn əˈvɔɪdɪd/",
    },
    {
      text: "It is the monitoring dashboard that alerted us to the anomaly.",
      phonetic: "/ɪt ɪz ðə ˈmɒnɪtərɪŋ ˈdæʃbɔːrd ðæt əˈlɜːtɪd ʌs tə ði əˈnɒməli/",
    },
    {
      text: "Under no circumstances should credentials be hard-coded.",
      phonetic: "/ˈʌndər nəʊ ˈsɜːkəmstænsɪz ʃʊd krɪˈdɛnʃəlz biː hɑːrd ˈkəʊdɪd/",
    },
  ],

  dictation: [
    {
      text: "A well-designed API should be consistent, predictable, and self-documenting.",
    },
    {
      text: "The most effective way to reduce technical debt is through incremental refactoring.",
    },
    {
      text: "Horizontal scaling involves adding more instances rather than increasing instance size.",
    },
    {
      text: "Conducting a blameless post-mortem encourages a culture of learning after incidents.",
    },
    {
      text: "Feature flags allow teams to decouple deployment from release.",
    },
  ],

  listening: [
    {
      text: "We migrated from a monolithic deployment to a microservices architecture last quarter. The main driver was our inability to scale individual components independently. Initially, we faced significant challenges with inter-service communication latency, which we addressed by introducing an event bus. Overall, deployment frequency increased by 300 percent.",
      question: "What was the primary reason for migrating to microservices?",
      options: [
        "Reducing operational costs",
        "Scaling components independently",
        "Improving developer productivity",
        "Eliminating inter-service communication",
      ],
      correct: 1,
    },
    {
      text: "During the code review, Sarah argued that the current implementation would introduce significant technical debt. She suggested adopting a strategy pattern instead of a long chain of conditionals. Mark agreed that the trade-off was worth the additional upfront complexity because it would simplify future feature additions.",
      question: "What was Sarah's main concern about the implementation?",
      options: [
        "It was too complex for the team to maintain",
        "It would create technical debt over time",
        "It violated the company's coding standards",
        "It did not pass the existing test suite",
      ],
      correct: 1,
    },
    {
      text: "When presenting to stakeholders, you must focus on outcomes rather than implementation details. Explain how the proposed architecture reduces time-to-market and lowers infrastructure costs. Avoid diving into specific technologies unless asked. Remember that your audience cares about risk, budget, and timeline above all else.",
      question: "According to the talk, what should presenters avoid?",
      options: [
        "Discussing business outcomes",
        "Explaining cost reductions",
        "Diving into specific technologies",
        "Mentioning timelines",
      ],
      correct: 2,
    },
  ],

  errorCorrection: [
    {
      incorrect: "If we would have deployed the fix earlier, the outage would not happen.",
      correct: "If we had deployed the fix earlier, the outage would not have happened.",
      explanation:
        "Third conditional requires 'if + had + past participle' in the condition clause and 'would have + past participle' in the result clause.",
    },
    {
      incorrect: "It is the database what causes the performance issue.",
      correct: "It is the database that causes the performance issue.",
      explanation:
        "Cleft sentences use 'that' (not 'what') after the emphasised element when the structure is 'It is ... that ...'.",
    },
    {
      incorrect: "Hardly we had started the deployment when the build failed.",
      correct: "Hardly had we started the deployment when the build failed.",
      explanation:
        "Inversion with 'hardly' requires the auxiliary verb to precede the subject: 'Hardly had we started'.",
    },
    {
      incorrect: "The architect suggested that the team rewrites the entire module.",
      correct: "The architect suggested that the team rewrite the entire module.",
      explanation:
        "The subjunctive mood is used after 'suggest that': the verb is bare infinitive ('rewrite'), not third-person singular ('rewrites').",
    },
  ],

  sentenceTransformation: [
    {
      prompt: "The team didn't run integration tests, so they missed the regression.",
      startWith: "Had",
      correct: [
        "Had the team run integration tests, they would not have missed the regression.",
        "Had the team run integration tests, they wouldn't have missed the regression.",
      ],
      hint: "Use third conditional inversion — 'Had' replaces 'If' and comes before the subject.",
      explanation:
        "Third conditional inversion: 'Had + subject + past participle' replaces 'If + subject + had + past participle'.",
    },
    {
      prompt: "The monitoring system alerted us. That is how we detected the breach.",
      startWith: "It was",
      correct: [
        "It was the monitoring system that alerted us to the breach.",
        "It was the monitoring system that alerted us and helped us detect the breach.",
      ],
      hint: "Use a cleft sentence with 'It was ... that ...' to emphasise the subject.",
      explanation:
        "Cleft sentences with 'It is/was ... that ...' shift focus onto a specific element of the sentence.",
    },
    {
      prompt:
        "The deployment failed because the configuration was outdated. The configuration was the real problem.",
      startWith: "What",
      correct: [
        "What caused the deployment to fail was the outdated configuration.",
        "What caused the deployment failure was the outdated configuration.",
      ],
      hint: "Use a 'What' cleft to emphasise the cause of the failure.",
      explanation:
        "A 'what' cleft front-focuses a clause, turning the emphasised element into the subject complement.",
    },
    {
      prompt:
        "You must never expose internal IP addresses in logs under any circumstances.",
      startWith: "Under no",
      correct: [
        "Under no circumstances must you expose internal IP addresses in logs.",
        "Under no circumstances should you expose internal IP addresses in logs.",
      ],
      hint: "Invert the subject and auxiliary after the negative adverbial phrase.",
      explanation:
        "Negative adverbial phrases like 'Under no circumstances' trigger subject-auxiliary inversion.",
    },
  ],

  clozePassage: null
};
