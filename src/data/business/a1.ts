export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What do you say when you meet someone in the morning?",
        options: ["Good evening", "Good morning", "Good night", "Goodbye"],
        correct: 1,
        explanation: "We say 'Good morning' when we meet someone in the morning."
      },
      {
        id: 2,
        question: "What is your job? I am a ____.",
        options: ["manager", "desk", "phone", "office"],
        correct: 0,
        explanation: "'Manager' is a job title. 'Desk', 'phone', and 'office' are things, not jobs."
      },
      {
        id: 3,
        question: "A: 'What is your name?' B: '____ name is Sarah.'",
        options: ["I", "My", "Me", "Mine"],
        correct: 1,
        explanation: "We use 'my' before a name: 'My name is Sarah.'"
      },
      {
        id: 4,
        question: "Which number is correct? 911 = ____.",
        options: ["nine-one-one", "nine-eleven", "ninety-eleven", "nine-one"],
        correct: 0,
        explanation: "We say each number separately for phone numbers: nine-one-one."
      },
      {
        id: 5,
        question: "Where is the phone? It is ____ the desk.",
        options: ["on", "in", "at", "under"],
        correct: 0,
        explanation: "We say 'on the desk' when something is on top of the desk."
      },
      {
        id: 6,
        question: "How do you spell 'John'?",
        options: ["J-O-H-N", "J-O-N-H", "H-O-J-N", "J-H-O-N"],
        correct: 0,
        explanation: "J-O-H-N is the correct spelling of the name John."
      },
      {
        id: 7,
        question: "The pen is ____. Please give it to me.",
        options: ["there", "left", "right", "here"],
        correct: 0,
        explanation: "We use 'there' when something is not near us."
      },
      {
        id: 8,
        question: "A: 'Thank you.' B: '____.'",
        options: ["Yes", "Sorry", "You're welcome", "Please"],
        correct: 2,
        explanation: "'You're welcome' is the correct reply to 'Thank you.'"
      }
    ]
  },
  flashcards: [
    {
      front: "Good morning",
      back: "Buongiorno (used before 12 PM)",
      example: "Good morning, Mr. Smith."
    },
    {
      front: "Manager",
      back: "Manager / Direttore",
      example: "I am a manager at ABC Company."
    },
    {
      front: "Desk",
      back: "Scrivania",
      example: "My desk is near the window."
    },
    {
      front: "Computer",
      back: "Computer",
      example: "I work on my computer every day."
    },
    {
      front: "Telephone / Phone",
      back: "Telefono",
      example: "Please answer the phone."
    },
    {
      front: "Pen",
      back: "Penna",
      example: "Do you have a pen I can use?"
    },
    {
      front: "Left",
      back: "Sinistra",
      example: "Turn left at the door."
    },
    {
      front: "Right",
      back: "Destra",
      example: "The office is on the right."
    }
  ],
  fillBlank: [
    {
      sentence: "Good ____, Mrs. Jones. How are you?",
      answer: "afternoon",
      options: ["afternoon", "morning", "evening", "night"],
      explanation: "Use 'Good afternoon' when you meet someone between 12 PM and 6 PM."
    },
    {
      sentence: "I ____ a new employee at this company.",
      answer: "am",
      options: ["am", "is", "are", "be"],
      explanation: "Use 'am' with 'I': I am a new employee."
    },
    {
      sentence: "Please sit ____ your chair.",
      answer: "on",
      options: ["on", "in", "at", "to"],
      explanation: "We sit 'on' a chair."
    },
    {
      sentence: "My phone number ____ 555-1234.",
      answer: "is",
      options: ["is", "am", "are", "be"],
      explanation: "Use 'is' with singular nouns like 'phone number'."
    },
    {
      sentence: "The meeting is ____ Room 2.",
      answer: "in",
      options: ["in", "on", "at", "to"],
      explanation: "Use 'in' for rooms: in Room 2."
    }
  ],
  matchPairs: [
    { left: "Good morning", right: "Used before 12 PM" },
    { left: "Good afternoon", right: "Used from 12 PM to 6 PM" },
    { left: "Good evening", right: "Used after 6 PM" },
    { left: "Hello", right: "A friendly greeting" },
    { left: "Goodbye", right: "A word when you leave" },
    { left: "See you later", right: "A casual goodbye" }
  ],
  reorder: [
    {
      words: ["name", "My", "is", "Anna"],
      correct: "My name is Anna."
    },
    {
      words: ["you", "How", "are"],
      correct: "How are you?"
    },
    {
      words: ["am", "a", "I", "designer"],
      correct: "I am a designer."
    },
    {
      words: ["pleased", "meet", "to", "you", "Nice"],
      correct: "Nice to meet you."
    },
    {
      words: ["is", "computer", "This", "my"],
      correct: "This is my computer."
    }
  ],
  speaking: [
    {
      text: "Good morning. My name is John.",
      phonetic: "/ɡʊd ˈmɔːnɪŋ | maɪ neɪm ɪz dʒɒn/"
    },
    {
      text: "I am a manager at this company.",
      phonetic: "/aɪ æm ə ˈmænɪdʒər æt ðɪs ˈkʌmpəni/"
    },
    {
      text: "Please have a seat.",
      phonetic: "/pliːz hæv ə siːt/"
    },
    {
      text: "Nice to meet you.",
      phonetic: "/naɪs tə miːt juː/"
    },
    {
      text: "My phone number is 555-6789.",
      phonetic: "/maɪ fəʊn ˈnʌmbər ɪz faɪv faɪv faɪv sɪks sɛvn eɪt naɪn/"
    }
  ],
  dictation: [
    { text: "Good morning, everyone." },
    { text: "My name is Lisa and I am your new colleague." },
    { text: "Please write your name on this paper." },
    { text: "The meeting is at three o'clock." },
    { text: "Turn left and go to the office." }
  ],
  listening: [
    {
      text: "Hello, my name is David. I work in the marketing department.",
      question: "Where does David work?",
      options: ["In sales", "In marketing", "In IT", "In HR"],
      correct: 1
    },
    {
      text: "Good afternoon. Please call me at 555-4321.",
      question: "What is the phone number?",
      options: ["555-1234", "555-4321", "555-6789", "555-0000"],
      correct: 1
    },
    {
      text: "The pen is on the desk and the computer is next to it.",
      question: "Where is the pen?",
      options: ["Under the desk", "In the drawer", "On the desk", "Next to the computer"],
      correct: 2
    }
  ],
  errorCorrection: [
    {
      incorrect: "I is a new employee.",
      correct: "I am a new employee.",
      explanation: "Use 'am' with 'I', not 'is'."
    },
    {
      incorrect: "She work in this office.",
      correct: "She works in this office.",
      explanation: "Use 'works' (verb + s) with 'she' in present simple."
    },
    {
      incorrect: "Goodbye morning.",
      correct: "Good morning.",
      explanation: "The correct greeting is 'Good morning', not 'Goodbye morning'."
    },
    {
      incorrect: "He are a manager.",
      correct: "He is a manager.",
      explanation: "Use 'is' with 'he', not 'are'."
    }
  ],
  sentenceTransformation: [
    {
      prompt: "My name is Tom. (Make a question)",
      startWith: "What",
      correct: ["What is your name?", "What's your name?"],
      hint: "Replace 'my' with 'your'. Start with 'What'.",
      explanation: "To ask for a name, say 'What is your name?'"
    },
    {
      prompt: "I am a teacher. (Change to 'She')",
      startWith: "She",
      correct: ["She is a teacher.", "She's a teacher."],
      hint: "Use 'is' instead of 'am' for 'She'.",
      explanation: "Use 'She is' (or 'She's') instead of 'I am'."
    },
    {
      prompt: "The phone is on the desk. (Make a question)",
      startWith: "Where",
      correct: ["Where is the phone?"],
      hint: "Start with 'Where is' and remove 'on the desk'.",
      explanation: "Use 'Where is' to ask about location."
    },
    {
      prompt: "This is my computer. (Change to question form)",
      startWith: "Is",
      correct: ["Is this your computer?"],
      hint: "Put 'Is' first and change 'my' to 'your'.",
      explanation: "For yes/no questions about possession, start with 'Is'."
    }
  ],
  clozePassage: null
};
