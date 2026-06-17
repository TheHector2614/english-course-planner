export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "Having ______ the conference talk on distributed systems, the lead engineer proposed a major architectural shift.",
        options: [
          "attended",
          "been attending",
          "being attended",
          "having been attended",
        ],
        correct: 0,
        explanation:
          "The perfect participle 'Having attended' indicates the action happened before the main clause — a B2+ participle clause structure.",
      },
      {
        id: 2,
        question:
          "______ any issues arise during the RFC review process, please escalate them to the steering committee immediately.",
        options: ["Would", "Should", "Could", "Must"],
        correct: 1,
        explanation:
          "'Should' at the start of a conditional clause is a formal inversion structure used in technical writing and RFCs.",
      },
      {
        id: 3,
        question:
          "Not only ______ the latency problem, but we also improved the overall throughput by 40%.",
        options: [
          "we solved",
          "did we solve",
          "we did solve",
          "solved we",
        ],
        correct: 1,
        explanation:
          "'Not only... but also' requires subject-auxiliary inversion — a hallmark of advanced English used in strategy discussions.",
      },
      {
        id: 4,
        question:
          "I wish we ______ the monitoring alerts before the incident escalated to a full outage.",
        options: ["configured", "had configured", "would configure", "were configuring"],
        correct: 1,
        explanation:
          "'I wish + past perfect' expresses regret about a past action — appropriate for incident post-mortems.",
      },
      {
        id: 5,
        question:
          "What ______ the senior reviewer emphasised was the long-term maintainability over short-term velocity.",
        options: ["does", "did", "has", "is"],
        correct: 1,
        explanation:
          "'What... emphasised was' uses a fronted clause (cleft sentence) to highlight the architectural concern in code review.",
      },
      {
        id: 6,
        question:
          "______ developer experience should be treated as a first-class concern is now widely accepted.",
        options: ["That", "What", "Which", "This"],
        correct: 0,
        explanation:
          "'That' introduces a nominal clause functioning as the subject — a formal construction common in technical discussions about DX.",
      },
      {
        id: 7,
        question:
          "The mentee reported ______ significant improvement after adopting the suggested refactoring patterns.",
        options: ["having seen", "to have seen", "having been seen", "being seen"],
        correct: 0,
        explanation:
          "'Having seen' is a perfect participle clause used after verbs of reporting — a B2+ structure for giving mentoring feedback.",
      },
      {
        id: 8,
        question:
          "Were the security audit ______ any sooner, we might have prevented the data exposure.",
        options: ["conducted", "to conduct", "to be conducted", "being conducted"],
        correct: 0,
        explanation:
          "'Were + past participle' is a formal inverted conditional — used in cutting-edge tech risk analysis and security discussions.",
      },
    ],
  },
  flashcards: [
    {
      front: "Request for Comments (RFC)",
      back: "A formal document proposing a design, architecture, or process change for review and discussion.",
      example: "Before implementing the new API, we submitted an RFC for team-wide feedback.",
    },
    {
      front: "post-mortem",
      back: "A retrospective analysis conducted after an incident to identify root causes and preventive measures.",
      example: "The post-mortem concluded that insufficient logging had delayed the detection of the bug.",
    },
    {
      front: "Architectural Decision Record (ADR)",
      back: "A document that captures a significant architectural decision, its context, and its consequences.",
      example: "We created an ADR to justify migrating from a monolith to a microservices architecture.",
    },
    {
      front: "Developer Experience (DX)",
      back: "The overall quality of interaction developers have with tools, APIs, and workflows in a codebase.",
      example: "Improving DX means reducing friction in the local development setup and CI pipeline.",
    },
    {
      front: "technical debt",
      back: "The implied cost of rework caused by choosing an easy solution now instead of a better long-term approach.",
      example: "Taking on technical debt is acceptable only when it is tracked and scheduled for repayment.",
    },
    {
      front: "code review",
      back: "A systematic examination of source code intended to find bugs and improve code quality before merging.",
      example: "Having reviewed the pull request, the senior engineer approved it conditional on the tests passing.",
    },
    {
      front: "incident response",
      back: "The structured approach taken to identify, contain, and resolve unplanned service disruptions.",
      example: "The incident response runbook outlined exactly whom to page and what metrics to check first.",
    },
    {
      front: "observability",
      back: "The ability to infer a system's internal state from its external outputs, using metrics, logs, and traces.",
      example: "Without proper observability, diagnosing performance regressions in production is nearly impossible.",
    },
  ],
  fillBlank: [
    {
      sentence:
        "Having ______ the deployment pipeline, the team reduced the release cycle from two weeks to two days.",
      answer: "automated",
      options: ["automated", "automating", "to automate", "being automated"],
      explanation:
        "The perfect participle 'Having automated' reflects a completed action before the result — a B2+ participle clause pattern.",
    },
    {
      sentence:
        "Not until the third retry ______ the service successfully recover from the cascade failure.",
      answer: "did",
      options: ["did", "had", "was", "has"],
      explanation:
        "'Not until' at the start triggers inversion: 'did the service ... recover'. This fronting is typical of formal incident reports.",
    },
    {
      sentence:
        "So critical ______ the architectural decision that the team scheduled two dedicated review sessions.",
      answer: "was",
      options: ["was", "were", "is", "being"],
      explanation:
        "'So critical was...' inverts the subject and verb for emphasis — an advanced inversion structure used in technical strategy discussions.",
    },
    {
      sentence:
        "Only after the performance benchmark ______ we consider merging the pull request.",
      answer: "can",
      options: ["can", "could", "may", "should"],
      explanation:
        "'Only after...' triggers inversion in the main clause. The present-tense context requires 'can' for a current policy statement.",
    },
    {
      sentence:
        "Were the test coverage ______ any lower, the refactoring would be considered too risky.",
      answer: "any",
      options: ["any", "some", "much", "even"],
      explanation:
        "'Were X any lower' is an inverted conditional with a comparative — a formal B2+ structure for expressing hypothetical risks in refactoring.",
    },
  ],
  matchPairs: [
    {
      left: "latency",
      right: "The delay between a request and its corresponding response in a system",
    },
    {
      left: "throughput",
      right: "The volume of work a system can handle within a given time period",
    },
    {
      left: "regression",
      right: "A bug introduced when a change breaks functionality that previously worked",
    },
    {
      left: "backward compatibility",
      right: "The ability of a newer system version to work with data or interfaces from an older version",
    },
    {
      left: "idempotency",
      right: "The property that performing the same operation multiple times produces the same result",
    },
    {
      left: "side effect",
      right: "An observable modification of state caused by a function beyond returning a value",
    },
  ],
  reorder: [
    {
      words: ["Having", "the", "legacy", "deprecated", "system", "we", "migrated", "to", "the", "cloud-native", "platform"],
      correct: "Having deprecated the legacy system, we migrated to the cloud-native platform.",
    },
    {
      words: ["Not", "only", "did", "the", "optimisation", "reduce", "costs", "but", "it", "improved", "response", "times"],
      correct: "Not only did the optimisation reduce costs, but it improved response times.",
    },
    {
      words: ["So", "subtle", "was", "the", "race", "condition", "that", "it", "escaped", "three", "review", "rounds"],
      correct: "So subtle was the race condition that it escaped three review rounds.",
    },
    {
      words: ["What", "the", "mentor", "emphasised", "was", "writing", "self-documenting", "code"],
      correct: "What the mentor emphasised was writing self-documenting code.",
    },
    {
      words: ["Were", "the", "alert", "thresholds", "adjusted", "sooner", "we", "might", "have", "prevented", "the", "pager", "storm"],
      correct: "Were the alert thresholds adjusted sooner, we might have prevented the pager storm.",
    },
  ],
  speaking: [
    {
      text: "Having reviewed the architecture, I recommend adopting a microservices split at the bounded context boundary.",
      phonetic: "/ˈhævɪŋ rɪˈvjuːd ði ˈɑːkɪtektʃə aɪ ˌrekəˈmend əˈdɒptɪŋ ə ˈmaɪkrəʊsɜːvɪsɪz splɪt æt ðə ˈbaʊndɪd ˈkɒntekst ˈbaʊndəri/",
    },
    {
      text: "Should any breaking changes be introduced, they must be documented in the RFC.",
      phonetic: "/ʃʊd ˈeni ˈbreɪkɪŋ ˈtʃeɪndʒɪz biː ˌɪntrəˈdjuːst ðeɪ mʌst biː ˈdɒkjʊmentɪd ɪn ði ɑːr es siː/",
    },
    {
      text: "Not only does observability help with debugging, it also drives architectural decisions.",
      phonetic: "/nɒt ˈəʊnli dʌz əbˌzɜːvəˈbɪləti help wɪð diːˈbʌɡɪŋ ɪt ˈɔːlsəʊ draɪvz ˌɑːkɪˈtektʃərəl dɪˈsɪʒənz/",
    },
    {
      text: "What we found during the post-mortem was a cascade of misconfigured timeouts.",
      phonetic: "/wɒt wiː faʊnd ˈdjʊərɪŋ ðə ˈpəʊstˈmɔːtəm wɒz ə kæˈskeɪd ɒv ˌmɪskənˈfɪɡəd ˈtaɪmaʊts/",
    },
    {
      text: "Were the latency to exceed the threshold, the circuit breaker would trip automatically.",
      phonetic: "/wɜː ðə ˈleɪtənsi tuː ɪkˈsiːd ðə ˈθreʃhəʊld ðə ˈsɜːkɪt ˈbreɪkə wʊd trɪp ˌɔːtəˈmætɪkli/",
    },
  ],
  dictation: [
    {
      text: "Having identified the root cause, the engineer drafted a remediation plan.",
    },
    {
      text: "Not until the log analysis completed did the pattern emerge.",
    },
    {
      text: "I wish the deprecated endpoint had been removed before the release.",
    },
    {
      text: "So critical was the decision that the lead architect was consulted directly.",
    },
    {
      text: "What distinguishes a senior review is the focus on long-term maintainability.",
    },
  ],
  listening: [
    {
      text: "During the conference talk, the speaker argued that having embraced event-driven architecture early on, their team avoided the tight coupling that plagued the original monolithic system. However, she cautioned that event sourcing introduces its own complexity — namely, eventual consistency and the need for robust schema evolution strategies.",
      question:
        "What challenge did the speaker associate with event-driven architecture?",
      options: [
        "Tight coupling between components",
        "Eventual consistency and schema evolution",
        "Monolithic deployment overhead",
        "Increased latency under high load",
      ],
      correct: 1,
    },
    {
      text: "In the post-mortem review, the lead acknowledged that the incident was ultimately caused by a silent failure in the health-check endpoint. The monitoring dashboard had shown green across all services, but the /ready probe had been returning a false positive for six minutes before the load balancer finally routed traffic away. 'Should the probe have validated an actual database connection,' he noted, 'we would have caught it three minutes sooner.'",
      question:
        "What was the root cause of the incident described?",
      options: [
        "A database connection timeout",
        "A false positive from the health-check probe",
        "A misconfigured load balancer",
        "A silent crash in the monitoring service",
      ],
      correct: 1,
    },
    {
      text: "During the mentoring session, the senior developer explained that code reviews should focus not only on correctness but also on design coherence. 'What distinguishes a valuable review,' she said, 'is its ability to anticipate how the code will evolve. Having reviewed hundreds of pull requests, I can tell you that the most expensive bugs are not syntax errors — they are architectural missteps that only surface six months later.'",
      question:
        "According to the senior developer, what is the most valuable aspect of a code review?",
      options: [
        "Finding syntax errors before merging",
        "Ensuring the code follows style guidelines",
        "Anticipating how the code will evolve over time",
        "Reducing the number of pull requests",
      ],
      correct: 2,
    },
  ],
  errorCorrection: [
    {
      incorrect:
        "After we have reviewed the ADR, we decided to reject the proposal.",
      correct:
        "Having reviewed the ADR, we decided to reject the proposal.",
      explanation:
        "The perfect participle 'Having reviewed' is more concise and formal than 'After we have reviewed' — B2+ prefers participle clauses for sequential actions.",
    },
    {
      incorrect:
        "Not only we reduced the deployment time, but also we improved reliability.",
      correct:
        "Not only did we reduce the deployment time, but we also improved reliability.",
      explanation:
        "'Not only' at the start of a clause triggers subject-auxiliary inversion in formal English.",
    },
    {
      incorrect:
        "I wish the team would have run the load test before the release.",
      correct:
        "I wish the team had run the load test before the release.",
      explanation:
        "With 'wish' to express regret about a past action, the past perfect ('had run') is required, not 'would have run'.",
    },
    {
      incorrect:
        "It is essential that the monitoring is configured before the deployment.",
      correct:
        "It is essential that the monitoring be configured before the deployment.",
      explanation:
        "In formal register after 'essential that', the mandative subjunctive ('be configured') is preferred in technical documentation.",
    },
  ],
  sentenceTransformation: [
    {
      prompt:
        "The team reviewed the incident report and then updated the runbook accordingly.",
      startWith: "Having",
      correct: [
        "Having reviewed the incident report, the team updated the runbook accordingly.",
        "Having reviewed the incident report the team updated the runbook accordingly",
      ],
      hint: "Use a perfect participle clause to combine both actions.",
      explanation:
        "The perfect participle 'Having reviewed' makes the sequence of actions explicit and the sentence more concise.",
    },
    {
      prompt:
        "The latency spike was so severe that the alerting system triggered five separate pages.",
      startWith: "So",
      correct: [
        "So severe was the latency spike that the alerting system triggered five separate pages.",
        "So severe was the latency spike that the alerting system triggered five pages",
      ],
      hint: "Invert the subject and verb after 'So' for emphasis.",
      explanation:
        "'So + adjective' fronting with inversion ('was the latency spike') adds formal emphasis — common in technical incident summaries.",
    },
    {
      prompt:
        "The team realised the severity only after the customer reported the outage.",
      startWith: "Only",
      correct: [
        "Only after the customer reported the outage did the team realise the severity.",
        "Only after the customer reported the outage did the team realize the severity",
      ],
      hint: "'Only after' triggers subject-auxiliary inversion in the main clause.",
      explanation:
        "'Only after... did...' is an advanced inversion pattern that emphasises the timing of the realisation.",
    },
    {
      prompt:
        "The senior engineer mentored the junior developer, and this was the most impactful outcome of the quarter.",
      startWith: "What",
      correct: [
        "What the senior engineer mentored the junior developer was the most impactful outcome of the quarter.",
        "What the senior engineer mentored the junior developer was the most impactful outcome",
      ],
      hint: "Use a cleft sentence structure starting with 'What'.",
      explanation:
        "'What... was...' is a fronted cleft structure that emphasises the mentoring relationship as the key achievement.",
    },
  ],
  clozePassage: null
};

// B2+ Technology English — Conference talks, RFCs, technical strategy,
// post-mortems, code review, DX, mentoring, cutting-edge tech discussions
