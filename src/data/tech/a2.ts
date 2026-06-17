export default {
  quiz: {
    questions: [
      {
        id: 1,
        question: "What do you click to save a file?",
        options: ["File > Save", "Edit > Copy", "View > Zoom", "Help > About"],
        correct: 0,
        explanation: "You use File > Save to save your work.",
      },
      {
        id: 2,
        question: "Which button do you press to close a window?",
        options: ["The X button", "The + button", "The _ button", "The ? button"],
        correct: 0,
        explanation: "The X button closes the window.",
      },
      {
        id: 3,
        question: "What does a folder contain?",
        options: ["Files", "Printers", "Monitors", "Keyboards"],
        correct: 0,
        explanation: "A folder stores and organises files.",
      },
      {
        id: 4,
        question: "What should you do first when an app freezes?",
        options: ["Restart the computer", "Buy a new computer", "Delete all files", "Unplug the keyboard"],
        correct: 0,
        explanation: "Restarting the computer is the first step in basic troubleshooting.",
      },
      {
        id: 5,
        question: "Where do you type a web address?",
        options: ["The search bar", "The menu", "The footer", "The sidebar"],
        correct: 0,
        explanation: "The search bar is where you type URLs or search terms.",
      },
      {
        id: 6,
        question: "What does 'download' mean?",
        options: ["Save a file from the internet", "Send a file to the internet", "Delete a file", "Rename a file"],
        correct: 0,
        explanation: "Downloading means copying a file from the internet to your device.",
      },
      {
        id: 7,
        question: "What is a link on a website?",
        options: ["Text or image you click to go to another page", "A type of font", "A computer virus", "A printer cable"],
        correct: 0,
        explanation: "A link (hypertext link) takes you to another page or resource when clicked.",
      },
      {
        id: 8,
        question: "How do you rename a file?",
        options: ["Right-click > Rename", "Double-click > Print", "Left-click > Delete", "Scroll > Zoom"],
        correct: 0,
        explanation: "Right-click on the file and select Rename to change its name.",
      },
    ],
  },

  flashcards: [
    {
      front: "open",
      back: "to start a program or file",
      example: "Open the file by double-clicking on it.",
    },
    {
      front: "save",
      back: "to store data on a computer",
      example: "Remember to save your work every few minutes.",
    },
    {
      front: "delete",
      back: "to remove a file or folder",
      example: "I deleted the old document by accident.",
    },
    {
      front: "rename",
      back: "to give a file or folder a new name",
      example: "She renamed the folder 'Photos'.",
    },
    {
      front: "restart",
      back: "to turn a computer off and on again",
      example: "Restart the laptop if the screen is frozen.",
    },
    {
      front: "download",
      back: "to copy a file from the internet to your device",
      example: "He downloaded the PDF from the website.",
    },
    {
      front: "upload",
      back: "to send a file from your device to the internet",
      example: "Upload your photo to the profile page.",
    },
    {
      front: "search bar",
      back: "a box where you type words to find information",
      example: "Type your question in the search bar and press Enter.",
    },
  ],

  fillBlank: [
    {
      sentence: "Click File then ______ to keep your document.",
      answer: "Save",
      options: ["Save", "Print", "Delete", "Close"],
      explanation: "Save stores your document so you can open it later.",
    },
    {
      sentence: "Use the ______ bar to find information on the web.",
      answer: "search",
      options: ["menu", "search", "address", "tool"],
      explanation: "The search bar helps you find websites and information.",
    },
    {
      sentence: "You can ______ a file by pressing the Delete key.",
      answer: "delete",
      options: ["open", "save", "delete", "print"],
      explanation: "Deleting a file moves it to the Recycle Bin.",
    },
    {
      sentence: "When the app stops working, ______ the computer.",
      answer: "restart",
      options: ["restart", "rename", "upload", "print"],
      explanation: "Restarting can fix many common problems.",
    },
    {
      sentence: "Click the X button to ______ the window.",
      answer: "close",
      options: ["open", "save", "close", "minimise"],
      explanation: "The X button closes the window completely.",
    },
  ],

  matchPairs: [
    { left: "File", right: "A collection of information stored on a computer" },
    { left: "Folder", right: "A container that holds files" },
    { left: "Homepage", right: "The main page of a website" },
    { left: "Link", right: "Clickable text or image that goes to another page" },
    { left: "Menu", right: "A list of options or commands" },
    { left: "Search bar", right: "A text box for typing keywords to find content" },
  ],

  reorder: [
    {
      words: ["file", "a", "open", "double-click", "to"],
      correct: "Double-click to open a file.",
    },
    {
      words: ["work", "save", "your", "remember", "to"],
      correct: "Remember to save your work.",
    },
    {
      words: ["the", "restart", "frozen", "computer", "when", "it", "is"],
      correct: "Restart the computer when it is frozen.",
    },
    {
      words: ["bar", "type", "in", "search", "the", "your", "question"],
      correct: "Type your question in the search bar.",
    },
    {
      words: ["click", "link", "the", "more", "for", "information"],
      correct: "Click the link for more information.",
    },
  ],

  speaking: [
    {
      text: "Save your file before you close the program.",
      phonetic: "/seɪv jɔːr faɪl bɪˈfɔːr juː kloʊz ðə ˈproʊɡræm/",
    },
    {
      text: "Restart the computer if it is slow.",
      phonetic: "/ˈriːstɑːrt ðə kəmˈpjuːtər ɪf ɪt ɪz sloʊ/",
    },
    {
      text: "Click the link to open the page.",
      phonetic: "/klɪk ðə lɪŋk tuː ˈoʊpən ðə peɪdʒ/",
    },
    {
      text: "Delete the files you do not need.",
      phonetic: "/dɪˈliːt ðə faɪlz juː duː nɒt niːd/",
    },
    {
      text: "Upload your photo to the website.",
      phonetic: "/ʌpˈloʊd jɔːr ˈfoʊtoʊ tuː ðə ˈwebˌsaɪt/",
    },
  ],

  dictation: [
    {
      text: "Open the folder and find the document.",
    },
    {
      text: "Print the file before the meeting.",
    },
    {
      text: "I downloaded the image from the website.",
    },
    {
      text: "The search bar is at the top of the page.",
    },
    {
      text: "He renamed the folder to 'Reports'.",
    },
  ],

  listening: [
    {
      text: "First, open the File menu. Then select Print. Finally, click OK.",
      question: "What is the second step?",
      options: ["Open the File menu", "Select Print", "Click OK", "Close the file"],
      correct: 1,
    },
    {
      text: "If your internet stops working, check the cable first. Then restart the router.",
      question: "What should you check first?",
      options: ["The router", "The computer", "The cable", "The printer"],
      correct: 2,
    },
    {
      text: "To rename a file, right-click on it. Choose Rename from the menu. Type the new name and press Enter.",
      question: "What do you do after right-clicking the file?",
      options: ["Press Enter", "Type the new name", "Choose Rename", "Close the menu"],
      correct: 2,
    },
  ],

  errorCorrection: [
    {
      incorrect: "He saved the file yesterday and then close the program.",
      correct: "He saved the file yesterday and then closed the program.",
      explanation: "Use past simple 'closed' to match 'saved'.",
    },
    {
      incorrect: "I download a photo from the internet last night.",
      correct: "I downloaded a photo from the internet last night.",
      explanation: "Use past simple 'downloaded' for an action that finished in the past.",
    },
    {
      incorrect: "She rename the folder after she uploaded the files.",
      correct: "She renamed the folder after she uploaded the files.",
      explanation: "Use past simple 'renamed' for completed past actions.",
    },
    {
      incorrect: "We search for the information and found it quickly.",
      correct: "We searched for the information and found it quickly.",
      explanation: "Use past simple 'searched' to match 'found'.",
    },
  ],

  sentenceTransformation: [
    {
      prompt: "I save my work every hour.",
      startWith: "Yesterday, I",
      correct: [
        "Yesterday, I saved my work every hour.",
        "Yesterday I saved my work every hour.",
      ],
      hint: "Change 'save' to past simple.",
      explanation: "When the time changes to yesterday, the verb changes to past simple 'saved'.",
    },
    {
      prompt: "You can find the menu at the top of the page.",
      startWith: "The menu",
      correct: [
        "The menu is at the top of the page.",
        "The menu can be found at the top of the page.",
      ],
      hint: "Start with 'The menu' and use 'is'.",
      explanation: "Rewrite the sentence starting with 'The menu' using the verb 'is'.",
    },
    {
      prompt: "He closed all the windows before he left.",
      startWith: "Before he left,",
      correct: [
        "Before he left, he closed all the windows.",
      ],
      hint: "Move the time clause to the start.",
      explanation: "The time clause 'Before he left' can go at the beginning of the sentence.",
    },
    {
      prompt: "You need to restart the computer.",
      startWith: "The computer",
      correct: [
        "The computer needs to be restarted.",
        "The computer needs restarting.",
      ],
      hint: "Start with 'The computer' and use 'needs'.",
      explanation: "Rewrite using the passive form with 'needs to be restarted'.",
    },
  ],

  clozePassage: {
    text: "Yesterday I {0} a file from the internet. First, I {1} on the download button. Then I {2} the file to my Documents folder. I {3} the file 'Report.docx'. Finally, I {4} the file to check it.",
    blanks: [
      {
        correct: "downloaded",
        options: ["downloaded", "uploaded", "deleted", "printed"],
        explanation: "You take a file from the internet to your computer — you download it.",
      },
      {
        correct: "clicked",
        options: ["clicked", "typed", "dragged", "pressed"],
        explanation: "You click on a button to start an action.",
      },
      {
        correct: "moved",
        options: ["moved", "copied", "opened", "renamed"],
        explanation: "Moving a file changes its location.",
      },
      {
        correct: "renamed",
        options: ["renamed", "deleted", "saved", "printed"],
        explanation: "Renaming gives the file a new name.",
      },
      {
        correct: "opened",
        options: ["opened", "closed", "deleted", "shared"],
        explanation: "Opening the file lets you see its contents.",
      },
    ],
  },
};
