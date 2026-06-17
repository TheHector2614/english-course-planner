export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What ___ you do every morning at work?",
        options: ["does", "do", "are", "is"],
        correct: 1,
        explanation: "We use 'do' with 'you' in present simple questions.",
      },
      {
        id: 2,
        question: "I ___ a meeting every Monday at 10am.",
        options: ["attend", "attends", "attending", "attended"],
        correct: 0,
        explanation: "Present simple for routines: 'I attend' with third person plural.",
      },
      {
        id: 3,
        question: "Yesterday, I ___ a client about the new contract.",
        options: ["call", "calls", "called", "calling"],
        correct: 2,
        explanation: "Past simple: 'called' for an action that happened yesterday.",
      },
      {
        id: 4,
        question: "The meeting is ___ 3pm in the conference room.",
        options: ["on", "in", "at", "by"],
        correct: 2,
        explanation: "We use 'at' for specific times (at 3pm, at 5 o'clock).",
      },
      {
        id: 5,
        question: "Please send the report ___ Friday.",
        options: ["in", "at", "on", "by"],
        correct: 3,
        explanation: "'By Friday' means on or before Friday.",
      },
      {
        id: 6,
        question: "My company ___ office furniture.",
        options: ["sell", "sells", "selling", "sold"],
        correct: 1,
        explanation: "Present simple third person: 'company' is 'it', so 'sells'.",
      },
      {
        id: 7,
        question: "Could I leave a ___ for Mr. Chen?",
        options: ["message", "email", "call", "note"],
        correct: 0,
        explanation: "'Leave a message' is a common phone phrase.",
      },
      {
        id: 8,
        question: "The printer is ___ the meeting room.",
        options: ["at", "on", "in", "between"],
        correct: 2,
        explanation: "We use 'in' for being inside a room.",
      },
    ],
  },
  flashcards: [
    {
      front: "deadline",
      back: "a date or time when something must be finished",
      example: "The deadline for the report is Friday at 5pm.",
    },
    {
      front: "meeting room",
      back: "a room where people have meetings",
      example: "Please book the meeting room for 2pm.",
    },
    {
      front: "schedule",
      back: "a plan of things to do and when to do them",
      example: "I have a busy schedule today.",
    },
    {
      front: "printer",
      back: "a machine that puts text or images onto paper",
      example: "The printer is out of paper.",
    },
    {
      front: "colleague",
      back: "a person you work with",
      example: "I had lunch with my colleague Anna.",
    },
    {
      front: "invoice",
      back: "a document that asks for payment",
      example: "Please send the invoice to the client.",
    },
    {
      front: "appointment",
      back: "an arrangement to meet someone at a specific time",
      example: "I have an appointment with the manager at 3pm.",
    },
    {
      front: "quarter",
      back: "one of four equal parts of a year (three months)",
      example: "Sales were good in the first quarter.",
    },
  ],
  fillBlank: [
    {
      sentence: "I usually ___ my emails at 8:30 in the morning.",
      answer: "check",
      options: ["make", "check", "write", "send"],
      explanation: "'Check emails' is a common workplace routine.",
    },
    {
      sentence: "She ___ a phone call to the supplier yesterday.",
      answer: "made",
      options: ["made", "makes", "make", "making"],
      explanation: "Past simple of 'make' is 'made'.",
    },
    {
      sentence: "The documents are ___ the filing cabinet.",
      answer: "in",
      options: ["on", "in", "at", "under"],
      explanation: "We use 'in' for inside furniture like cabinets and drawers.",
    },
    {
      sentence: "We need to finish this project ___ the end of the month.",
      answer: "by",
      options: ["in", "on", "at", "by"],
      explanation: "'By' indicates a deadline or time limit.",
    },
    {
      sentence: "He ___ as a customer service representative.",
      answer: "works",
      options: ["work", "works", "working", "worked"],
      explanation: "Present simple third person: 'He works'.",
    },
  ],
  matchPairs: [
    { left: "Attend a meeting", right: "Go to a meeting" },
    { left: "Send an email", right: "Write and send a message online" },
    { left: "Meet a deadline", right: "Finish work on time" },
    { left: "Make a phone call", right: "Call someone by phone" },
    { left: "Book a room", right: "Reserve a room for a meeting" },
    { left: "Process an order", right: "Handle a customer request" },
  ],
  reorder: [
    {
      words: ["usually", "I", "at 9am", "start", "work"],
      correct: "I usually start work at 9am.",
    },
    {
      words: ["the report", "finished", "She", "yesterday"],
      correct: "She finished the report yesterday.",
    },
    {
      words: ["a meeting", "there", "Is", "at 2pm", "?"],
      correct: "Is there a meeting at 2pm?",
    },
    {
      words: ["our company", "software", "develops", "for businesses"],
      correct: "Our company develops software for businesses.",
    },
    {
      words: ["many", "How", "employees", "does", "your company", "have", "?"],
      correct: "How many employees does your company have?",
    },
  ],
  speaking: [
    { text: "I check my emails every morning.", phonetic: "/aɪ tʃek maɪ ˈiːmeɪlz ˈevri ˈmɔːrnɪŋ/" },
    { text: "The meeting is at three o'clock.", phonetic: "/ðə ˈmiːtɪŋ ɪz æt θriː əˈklɒk/" },
    { text: "I worked from home yesterday.", phonetic: "/aɪ wɜːrkt frəm hoʊm ˈjestərdeɪ/" },
    { text: "Could you call me back, please?", phonetic: "/kʊd juː kɔːl miː bæk pliːz/" },
    { text: "Our office closes at six pm.", phonetic: "/ˈaʊər ˈɒfɪs ˈkloʊzɪz æt sɪks piː em/" },
  ],
  dictation: [
    { text: "I have a meeting with the manager at 2pm." },
    { text: "She sent the invoice to the client yesterday." },
    { text: "Please print the documents for the conference." },
    { text: "We need to finish the report by Friday." },
    { text: "He works in the marketing department." },
  ],
  listening: [
    {
      text: "Good morning, this is Sarah from Bright Solutions. I'm calling about the order we placed last week. Could you check the delivery date, please?",
      question: "Why is Sarah calling?",
      options: ["To place a new order", "To check a delivery date", "To cancel an order", "To ask for a refund"],
      correct: 1,
    },
    {
      text: "Hi Tom, it's Mark. I'm going to be late for the 10 o'clock meeting. Can you let everyone know I'll be there at 10:30? Thanks.",
      question: "What time will Mark arrive at the meeting?",
      options: ["At 9:00", "At 10:00", "At 10:30", "At 11:00"],
      correct: 2,
    },
    {
      text: "Our company opened a new office in Berlin last year. We now have twenty-five employees there. The office is near the city center.",
      question: "How many employees work in the Berlin office?",
      options: ["Fifteen", "Twenty", "Twenty-five", "Fifty"],
      correct: 2,
    },
  ],
  errorCorrection: [
    {
      incorrect: "He work in the sales department.",
      correct: "He works in the sales department.",
      explanation: "Third person singular needs -s: 'He works'.",
    },
    {
      incorrect: "I didn't called the client yesterday.",
      correct: "I didn't call the client yesterday.",
      explanation: "After 'didn't', use the base form of the verb (call).",
    },
    {
      incorrect: "We are have a meeting on 3pm.",
      correct: "We are having a meeting at 3pm.",
      explanation: "Use 'at' for specific times, not 'on'. Also 'are having' is present continuous.",
    },
    {
      incorrect: "How many employee does your company have?",
      correct: "How many employees does your company have?",
      explanation: "'Employees' must be plural after 'how many'.",
    },
  ],
  sentenceTransformation: [
    {
      prompt: "I usually arrive at work at 8:30.",
      startWith: "My usual",
      correct: ["My usual start time is 8:30.", "My usual time to arrive at work is 8:30."],
      hint: "Use 'start time' or 'time to arrive'.",
      explanation: "Rewrite using 'usual' to describe a habit.",
    },
    {
      prompt: "She sent the email yesterday afternoon.",
      startWith: "The email",
      correct: ["The email was sent yesterday afternoon.", "The email was sent by her yesterday afternoon."],
      hint: "Use passive voice.",
      explanation: "The object (email) becomes the subject in passive form.",
    },
    {
      prompt: "He works in a team. He likes it.",
      startWith: "He enjoys",
      correct: ["He enjoys working in a team.", "He enjoys working in a team."],
      hint: "Use 'enjoys + -ing'.",
      explanation: "Combine the two ideas using 'enjoys + gerund'.",
    },
    {
      prompt: "The meeting is at 2pm.",
      startWith: "The meeting starts",
      correct: ["The meeting starts at 2pm.", "The meeting starts at 2pm."],
      hint: "Use 'starts' instead of 'is'.",
      explanation: "Rewrite using 'starts' to give the same time information.",
    },
  ],
  clozePassage: {
    text: "Hi Anna,\n\nThank you for your email. I am writing to confirm our {0} on Monday. It {1} at 10am in the main meeting room. Please bring the {2} for the new project. If you have any {3}, please let me know.\n\nBest regards,\nTom",
    blanks: [
      {
        correct: "meeting",
        options: ["meeting", "lunch", "party", "holiday"],
        explanation: "The context is about a work appointment — 'meeting' fits best.",
      },
      {
        correct: "starts",
        options: ["starts", "start", "started", "starting"],
        explanation: "Third person singular present simple: 'It starts'.",
      },
      {
        correct: "documents",
        options: ["documents", "food", "tickets", "photos"],
        explanation: "In a work context, you bring 'documents' to a project meeting.",
      },
      {
        correct: "questions",
        options: ["questions", "problems", "complaints", "ideas"],
        explanation: "'If you have any questions' is a standard email closing phrase.",
      },
    ],
  },
};
