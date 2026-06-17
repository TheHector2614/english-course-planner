export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What do you use to move the cursor on a computer screen?",
        options: ["Keyboard", "Mouse", "Printer", "Speaker"],
        correct: 1,
        explanation: "A mouse is used to move the cursor on the screen.",
      },
      {
        id: 2,
        question: "What do you press to type a letter?",
        options: ["A mouse button", "A key on the keyboard", "The screen", "The printer"],
        correct: 1,
        explanation: "You press keys on the keyboard to type letters.",
      },
      {
        id: 3,
        question: "Where do you see images and text on a computer?",
        options: ["Keyboard", "Mouse", "Screen", "Printer"],
        correct: 2,
        explanation: "The screen shows images and text.",
      },
      {
        id: 4,
        question: "What does a printer do?",
        options: ["It shows pictures.", "It types words.", "It prints paper.", "It clicks buttons."],
        correct: 2,
        explanation: "A printer prints documents and images on paper.",
      },
      {
        id: 5,
        question: "What is a website?",
        options: ["A place on the internet", "A computer screen", "A type of mouse", "A printer paper"],
        correct: 0,
        explanation: "A website is a place on the internet with information.",
      },
      {
        id: 6,
        question: "What do you need to log in to a website?",
        options: ["A mouse and a keyboard", "A password and a username", "A screen and a printer", "A website and an email"],
        correct: 1,
        explanation: "You need a password and a username to log in.",
      },
      {
        id: 7,
        question: "What does 'click here' mean?",
        options: ["Type a word", "Press a key", "Press the mouse button", "Open the printer"],
        correct: 2,
        explanation: "'Click here' means press the mouse button on that place.",
      },
      {
        id: 8,
        question: "What is an email?",
        options: ["A website", "A message on the internet", "A computer part", "A password"],
        correct: 1,
        explanation: "An email is a message you send on the internet.",
      },
    ],
  },
  flashcards: [
    {
      front: "Mouse",
      back: "A small device you move with your hand to control the cursor.",
      example: "I use a mouse to click on icons.",
    },
    {
      front: "Keyboard",
      back: "A set of keys you press to type letters and numbers.",
      example: "I type my name on the keyboard.",
    },
    {
      front: "Screen",
      back: "The part of the computer that shows words and pictures.",
      example: "I look at the screen to read emails.",
    },
    {
      front: "Printer",
      back: "A machine that puts text and images on paper.",
      example: "I print my homework with the printer.",
    },
    {
      front: "Click",
      back: "To press and release a mouse button.",
      example: "Click the icon to open the program.",
    },
    {
      front: "Password",
      back: "A secret word or numbers you use to log in.",
      example: "I type my password to open my email.",
    },
    {
      front: "Website",
      back: "A page or group of pages on the internet.",
      example: "I visit a website to read the news.",
    },
    {
      front: "Login",
      back: "To enter your username and password to use a website.",
      example: "I log in to check my messages.",
    },
  ],
  fillBlank: [
    {
      sentence: "I use a _____ to move the cursor on the screen.",
      answer: "mouse",
      options: ["mouse", "keyboard", "printer", "speaker"],
      explanation: "A mouse controls the cursor on the screen.",
    },
    {
      sentence: "Please _____ the icon to open the file.",
      answer: "click",
      options: ["type", "print", "click", "close"],
      explanation: "You click on an icon to open a file.",
    },
    {
      sentence: "You need a _____ to log into your account.",
      answer: "password",
      options: ["mouse", "screen", "password", "email"],
      explanation: "A password keeps your account safe.",
    },
    {
      sentence: "I _____ an email to my friend every day.",
      answer: "send",
      options: ["print", "send", "click", "open"],
      explanation: "You send an email to someone on the internet.",
    },
    {
      sentence: "Press _____ on the keyboard to go to a new line.",
      answer: "enter",
      options: ["escape", "shift", "enter", "space"],
      explanation: "The Enter key moves the cursor to a new line.",
    },
  ],
  matchPairs: [
    { left: "Mouse", right: "Moves the cursor" },
    { left: "Keyboard", right: "Types letters and numbers" },
    { left: "Screen", right: "Shows pictures and text" },
    { left: "Printer", right: "Prints documents on paper" },
    { left: "Click", right: "Press a mouse button" },
    { left: "Email", right: "A message on the internet" },
  ],
  reorder: [
    {
      words: ["Click", "the", "icon"],
      correct: "Click the icon.",
    },
    {
      words: ["Press", "Enter", "please"],
      correct: "Press Enter please.",
    },
    {
      words: ["Open", "the", "file"],
      correct: "Open the file.",
    },
    {
      words: ["I", "send", "an", "email"],
      correct: "I send an email.",
    },
    {
      words: ["Type", "your", "password"],
      correct: "Type your password.",
    },
  ],
  speaking: [
    { text: "Click the mouse.", phonetic: "/klɪk ðə maʊs/" },
    { text: "Press the key.", phonetic: "/prɛs ðə kiː/" },
    { text: "Open the website.", phonetic: "/ˈəʊpən ðə ˈwɛbsaɪt/" },
    { text: "Type your password.", phonetic: "/taɪp jɔː ˈpɑːswɜːd/" },
    { text: "Send an email.", phonetic: "/sɛnd æn ˈiːmeɪl/" },
  ],
  dictation: [
    { text: "Click the icon." },
    { text: "Press Enter on the keyboard." },
    { text: "Open the website." },
    { text: "Type your password." },
    { text: "Send an email." },
  ],
  listening: [
    {
      text: "Click the mouse button to open the file.",
      question: "What do you click to open the file?",
      options: ["The keyboard", "The mouse button", "The screen", "The printer"],
      correct: 1,
    },
    {
      text: "You need a password to log into the website.",
      question: "What do you need to log in?",
      options: ["A printer", "A mouse", "A password", "An email"],
      correct: 2,
    },
    {
      text: "I print my homework with the printer at home.",
      question: "Where does he print his homework?",
      options: ["At school", "At home", "In the office", "In a shop"],
      correct: 1,
    },
  ],
  errorCorrection: [
    {
      incorrect: "I clicks the mouse.",
      correct: "I click the mouse.",
      explanation: "With 'I', use 'click' not 'clicks'.",
    },
    {
      incorrect: "She type a email.",
      correct: "She types an email.",
      explanation: "With 'she', use 'types'. Use 'an' before 'email'.",
    },
    {
      incorrect: "He press the button.",
      correct: "He presses the button.",
      explanation: "With 'he', add -es to 'press'.",
    },
    {
      incorrect: "We opens the website.",
      correct: "We open the website.",
      explanation: "With 'we', use 'open' not 'opens'.",
    },
  ],
  sentenceTransformation: [
    {
      prompt: "I click the mouse. (change to 'he')",
      startWith: "He",
      correct: ["He clicks the mouse."],
      hint: "Add -s to the verb for 'he'.",
      explanation: "With third person singular 'he', add -s to 'click'.",
    },
    {
      prompt: "He sends an email. (change to 'they')",
      startWith: "They",
      correct: ["They send an email."],
      hint: "Remove -s from the verb for 'they'.",
      explanation: "With 'they', use the base verb 'send' without -s.",
    },
    {
      prompt: "Open the file. (change to negative)",
      startWith: "Do not",
      correct: ["Do not open the file."],
      hint: "Use 'do not' before the verb.",
      explanation: "To make a negative command, add 'do not' before the verb.",
    },
    {
      prompt: "I type my password. (make a question)",
      startWith: "Do",
      correct: ["Do I type my password?"],
      hint: "Start the question with 'Do'.",
      explanation: "To make a question with 'I', start with 'Do'.",
    },
  ],
  clozePassage: null,
};
