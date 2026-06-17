interface Story {
  id: string;
  title: string;
  level: string;
  words: number;
  content: string;
  comprehensionQs: { question: string; options: string[]; correct: number }[];
  vocabulary: { word: string; definition: string; example?: string }[];
}

export const storiesByLevel: Record<string, Story[]> = {
  a1: [
    {
      id: "a1-my-day",
      title: "My Day",
      level: "a1",
      words: 145,
      content:
        "Every day I wake up at seven o'clock. First, I brush my teeth and wash my face. Then I eat breakfast. I usually have bread and milk. At eight o'clock, I go to school. I walk to school with my friend. School starts at nine. I have four classes in the morning. At twelve o'clock, I eat lunch. In the afternoon, I have two more classes. School finishes at three. I go home and do my homework. In the evening, I have dinner with my family. I watch TV or read a book. I go to bed at ten o'clock.",
      comprehensionQs: [
        {
          question: "What time does the person wake up?",
          options: ["At six o'clock", "At seven o'clock", "At eight o'clock", "At nine o'clock"],
          correct: 1,
        },
        {
          question: "How does the person go to school?",
          options: ["By bus", "By car", "By bike", "Walks"],
          correct: 3,
        },
        {
          question: "How many classes does the person have in the morning?",
          options: ["Two", "Three", "Four", "Five"],
          correct: 2,
        },
        {
          question: "What does the person do in the evening?",
          options: ["Play video games", "Watch TV or read", "Go to the park", "Visit friends"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "wake up", definition: "To stop sleeping", example: "I wake up at seven every day." },
        { word: "brush", definition: "To clean teeth with a brush" },
        { word: "breakfast", definition: "The first meal of the day", example: "I eat breakfast at seven." },
        { word: "usually", definition: "Normally; most of the time", example: "I usually walk to school." },
        { word: "finish", definition: "To come to an end; complete", example: "School finishes at three." },
        { word: "homework", definition: "School work done at home", example: "I do my homework after school." },
        { word: "dinner", definition: "The main meal of the day, in the evening", example: "We have dinner at seven." },
      ],
    },
    {
      id: "a1-toms-pet",
      title: "Tom's Pet Cat",
      level: "a1",
      words: 130,
      content:
        "Tom has a cat. The cat's name is Whiskers. Whiskers is very friendly. She is white and black. Tom's cat likes to play with a red ball. Every morning, Whiskers wakes Tom up. She sits on his bed. Tom gives Whiskers food and water. In the afternoon, Whiskers sleeps on the sofa. Tom plays with Whiskers after school. Whiskers likes to chase the ball. Tom loves his cat very much.",
      comprehensionQs: [
        {
          question: "What is the cat's name?",
          options: ["Tom", "Whiskers", "Snowball", "Mittens"],
          correct: 1,
        },
        {
          question: "What color is the cat?",
          options: ["White only", "Black only", "White and black", "White and brown"],
          correct: 2,
        },
        {
          question: "Where does the cat sleep?",
          options: ["On the bed", "On the sofa", "On the floor", "Outside"],
          correct: 1,
        },
        {
          question: "What does the cat like to chase?",
          options: ["A mouse", "A ball", "A bird", "A string"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "pet", definition: "An animal that lives with you", example: "Tom has a pet cat." },
        { word: "friendly", definition: "Nice and kind", example: "Whiskers is friendly." },
        { word: "chase", definition: "To run after something", example: "The cat likes to chase the ball." },
        { word: "loves", definition: "To like very much", example: "Tom loves his cat." },
      ],
    },
    {
      id: "a1-the-park",
      title: "A Day at the Park",
      level: "a1",
      words: 155,
      content:
        "It is Saturday. Sarah and Ben go to the park. The park is big and green. There are many trees and flowers. Sarah brings a book. Ben brings a ball. Sarah sits under a tree and reads. Ben plays football with his friends. The weather is sunny and warm. A dog runs in the park. Some birds sing in the trees. At twelve o'clock, they eat sandwiches for lunch. They are very happy. They go home at four o'clock.",
      comprehensionQs: [
        {
          question: "What day is it?",
          options: ["Sunday", "Saturday", "Monday", "Friday"],
          correct: 1,
        },
        {
          question: "What does Sarah bring?",
          options: ["A ball", "A book", "A dog", "A sandwich"],
          correct: 1,
        },
        {
          question: "What is the weather like?",
          options: ["Rainy", "Cold", "Sunny and warm", "Cloudy"],
          correct: 2,
        },
        {
          question: "When do they go home?",
          options: ["At two", "At three", "At four", "At five"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "park", definition: "A public area with grass and trees", example: "We play at the park." },
        { word: "bring", definition: "To carry something with you", example: "Sarah brings a book." },
        { word: "weather", definition: "The condition of the air outside", example: "The weather is sunny." },
        { word: "happy", definition: "Feeling good or pleased", example: "They are very happy." },
      ],
    },
    {
      id: "a1-my-family",
      title: "My Family",
      level: "a1",
      words: 120,
      content:
        "Hi, I am Emma. This is my family. My father is a doctor. He is tall and kind. My mother is a teacher. She is very nice. I have one brother. His name is Leo. He is ten years old. We have a dog. His name is Max. Max is brown and white. I love my family. On weekends, we go to the park together. My mother cooks dinner. My father helps me with my homework. We are very happy.",
      comprehensionQs: [
        {
          question: "What does Emma's mother do?",
          options: ["She is a doctor", "She is a teacher", "She is a nurse", "She is a cook"],
          correct: 1,
        },
        {
          question: "How old is Leo?",
          options: ["Eight", "Nine", "Ten", "Eleven"],
          correct: 2,
        },
        {
          question: "What color is Max?",
          options: ["Brown and black", "Brown and white", "White and gray", "Black and white"],
          correct: 1,
        },
        {
          question: "What does Emma's father help her with?",
          options: ["Cooking", "Homework", "Cleaning", "Sports"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "father", definition: "A male parent", example: "My father is a doctor." },
        { word: "mother", definition: "A female parent", example: "My mother is a teacher." },
        { word: "brother", definition: "A male sibling", example: "I have one brother." },
        { word: "kind", definition: "Nice and caring", example: "My father is kind." },
        { word: "together", definition: "With each other", example: "We go to the park together." },
      ],
    },
    {
      id: "a1-school",
      title: "My School Day",
      level: "a1",
      words: 140,
      content:
        "My school is big. There are twenty classrooms and a big playground. My teacher is Mrs. Green. She is very nice. I have many friends at school. We play together at break time. I like English and math. My favorite subject is art. I like to draw and paint. We have lunch at twelve. The food is good. After lunch we play outside. School finishes at three thirty. I go home with my sister. I like my school very much.",
      comprehensionQs: [
        {
          question: "How many classrooms are there?",
          options: ["Ten", "Fifteen", "Twenty", "Twenty-five"],
          correct: 2,
        },
        {
          question: "Who is Mrs. Green?",
          options: ["A student", "The teacher", "The cook", "The mother"],
          correct: 1,
        },
        {
          question: "What is the writer's favorite subject?",
          options: ["English", "Math", "Art", "Science"],
          correct: 2,
        },
        {
          question: "When does school finish?",
          options: ["At three", "At three thirty", "At four", "At four thirty"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "classroom", definition: "A room where students learn", example: "Our classroom is big." },
        { word: "playground", definition: "An outdoor area for playing", example: "The children are in the playground." },
        { word: "subject", definition: "A topic you study at school", example: "My favorite subject is art." },
        { word: "favorite", definition: "The one you like most", example: "This is my favorite book." },
        { word: "together", definition: "With each other", example: "We play together at break." },
      ],
    },
    {
      id: "a1-food",
      title: "My Favorite Food",
      level: "a1",
      words: 135,
      content:
        "I like many kinds of food. My favorite food is pizza. It has cheese and tomato on top. My mother makes pizza at home. It is very good. I also like fruit. I eat apples and bananas every day. For breakfast I have cereal with milk. For lunch I eat rice with chicken. For dinner I like pasta. I drink water and milk. I do not like coffee. It is too bitter. My favorite drink is orange juice. I eat healthy food every day.",
      comprehensionQs: [
        {
          question: "What is the writer's favorite food?",
          options: ["Pasta", "Pizza", "Rice", "Chicken"],
          correct: 1,
        },
        {
          question: "What fruit does the writer eat every day?",
          options: ["Oranges and grapes", "Apples and bananas", "Pears and apples", "Bananas and oranges"],
          correct: 1,
        },
        {
          question: "What does the writer have for breakfast?",
          options: ["Pizza", "Rice", "Cereal with milk", "Bread"],
          correct: 2,
        },
        {
          question: "What is the writer's favorite drink?",
          options: ["Coffee", "Milk", "Water", "Orange juice"],
          correct: 3,
        },
      ],
      vocabulary: [
        { word: "pizza", definition: "A food with bread, cheese, and tomato", example: "I like pizza." },
        { word: "cereal", definition: "A breakfast food made from grains", example: "I eat cereal with milk." },
        { word: "bitter", definition: "A strong, not sweet taste", example: "Coffee is bitter." },
        { word: "healthy", definition: "Good for your body", example: "Fruit is healthy food." },
        { word: "juice", definition: "A drink made from fruit", example: "I drink orange juice." },
      ],
    },
  ],
  a2: [
    {
      id: "a2-weekend-trip",
      title: "A Weekend Trip",
      level: "a2",
      words: 220,
      content:
        "Last weekend, Maria went to the beach with her family. They drove for two hours. The weather was beautiful. The sun was shining and the water was warm. Maria swam in the sea for an hour. Her brother built a big sandcastle. Her parents read books under an umbrella. At noon, they had a picnic. They ate sandwiches, fruit, and drank cold lemonade. In the afternoon, they played volleyball on the sand. Maria took many photos. They returned home at eight in the evening. Everyone was tired but very happy. Maria said, 'This was the best weekend ever.'",
      comprehensionQs: [
        {
          question: "Where did Maria go last weekend?",
          options: ["To the mountains", "To the beach", "To the city", "To the countryside"],
          correct: 1,
        },
        {
          question: "How long did they drive?",
          options: ["One hour", "Two hours", "Three hours", "Four hours"],
          correct: 1,
        },
        {
          question: "What did Maria's brother do?",
          options: ["Swam in the sea", "Built a sandcastle", "Read a book", "Played volleyball"],
          correct: 1,
        },
        {
          question: "How did everyone feel at the end?",
          options: ["Angry", "Bored", "Tired but happy", "Sad"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "beach", definition: "A sandy area by the sea", example: "We went to the beach." },
        { word: "sandcastle", definition: "A small castle made of sand", example: "The boy built a sandcastle." },
        { word: "picnic", definition: "An outdoor meal", example: "We had a picnic on the beach." },
        { word: "lemonade", definition: "A cold drink made from lemons", example: "We drank lemonade." },
        { word: "volleyball", definition: "A game where you hit a ball over a net", example: "They played volleyball." },
      ],
    },
    {
      id: "a2-shopping",
      title: "A Shopping Trip",
      level: "a2",
      words: 200,
      content:
        "Yesterday, Lucy and her mother went shopping at the mall. The mall was very busy. There were many people in every store. Lucy wanted to buy a new dress for the party. She tried on three dresses. The first one was too small. The second one was too big. The third one was perfect. It was blue with white flowers. It was also cheaper than the others. Her mother bought a pair of shoes and a handbag. They looked at many stores before choosing. They had lunch at a nice cafe. Lucy had a sandwich and her mother had soup. They went home at five o'clock. Lucy was very happy with her new dress.",
      comprehensionQs: [
        {
          question: "Where did Lucy go shopping?",
          options: ["To the market", "To the mall", "To the supermarket", "To the street shop"],
          correct: 1,
        },
        {
          question: "Why did Lucy want a new dress?",
          options: ["For school", "For the party", "For a wedding", "For work"],
          correct: 1,
        },
        {
          question: "What color was the dress she bought?",
          options: ["Red with white flowers", "Blue with white flowers", "Green with yellow flowers", "Pink with white flowers"],
          correct: 1,
        },
        {
          question: "What did Lucy's mother buy?",
          options: ["A dress and a bag", "Shoes and a handbag", "A hat and shoes", "A handbag and a dress"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "mall", definition: "A large building with many shops", example: "We went to the mall." },
        { word: "try on", definition: "To put on clothes to see if they fit", example: "She tried on the dress." },
        { word: "perfect", definition: "Exactly right", example: "The dress was perfect." },
        { word: "cheaper", definition: "Costing less money", example: "This one is cheaper." },
        { word: "handbag", definition: "A bag for carrying personal items", example: "She bought a new handbag." },
      ],
    },
    {
      id: "a2-restaurant",
      title: "Dinner at a Restaurant",
      level: "a2",
      words: 210,
      content:
        "Last Friday, Tom and his family went to an Italian restaurant. It was Tom's birthday. The restaurant was small but cozy. Red and white tablecloths covered the tables. Soft music was playing in the background. A waiter came to their table and gave them menus. Tom ordered spaghetti with meatballs. His father chose lasagna. His mother had a salad. The food was delicious. Tom's favorite part was the dessert. He had a big piece of chocolate cake. After dinner, the waiter brought a small candle on the cake. Everyone sang Happy Birthday. Tom felt very special. He said it was the best birthday dinner he ever had.",
      comprehensionQs: [
        {
          question: "Why did Tom's family go to the restaurant?",
          options: ["For a celebration", "For Tom's birthday", "For a holiday", "For a meeting"],
          correct: 1,
        },
        {
          question: "What did Tom order?",
          options: ["Lasagna", "Spaghetti with meatballs", "Pizza", "Salad"],
          correct: 1,
        },
        {
          question: "What was Tom's favorite part of the meal?",
          options: ["The spaghetti", "The salad", "The dessert", "The bread"],
          correct: 2,
        },
        {
          question: "What did the waiter bring after dinner?",
          options: ["A gift", "A candle on the cake", "More food", "The bill"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "restaurant", definition: "A place where you buy and eat meals", example: "We ate at a restaurant." },
        { word: "cozy", definition: "Warm and comfortable", example: "The restaurant was cozy." },
        { word: "waiter", definition: "A person who serves food in a restaurant", example: "The waiter brought our food." },
        { word: "menu", definition: "A list of food you can order", example: "I looked at the menu." },
        { word: "delicious", definition: "Very tasty", example: "The pasta was delicious." },
        { word: "dessert", definition: "Sweet food eaten after a meal", example: "We had cake for dessert." },
      ],
    },
    {
      id: "a2-weather",
      title: "The Changing Weather",
      level: "a2",
      words: 195,
      content:
        "Last week, the weather changed a lot. On Monday it was sunny and hot. The temperature was thirty degrees. On Tuesday, it started to rain. The rain was heavy. On Wednesday, it was colder than Monday. I wore a jacket to school. Thursday was the worst day. There was a big storm. The wind was very strong. Some trees fell on the road. On Friday, the weather was better. The sun came out again. On Saturday and Sunday, it was warm and beautiful. I played outside with my friends. The weather this week is nicer than last week. I hope it stays sunny.",
      comprehensionQs: [
        {
          question: "What was the weather like on Monday?",
          options: ["Rainy", "Cold", "Sunny and hot", "Cloudy"],
          correct: 2,
        },
        {
          question: "What happened on Thursday?",
          options: ["It snowed", "There was a storm", "It was sunny", "It was cold"],
          correct: 1,
        },
        {
          question: "When does the writer play outside?",
          options: ["On Friday", "On Saturday and Sunday", "On Monday", "On Wednesday"],
          correct: 1,
        },
        {
          question: "How is this week's weather compared to last week?",
          options: ["Worse", "The same", "Nicer", "Colder"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "temperature", definition: "How hot or cold something is", example: "The temperature is high today." },
        { word: "heavy rain", definition: "A lot of rain", example: "There was heavy rain last night." },
        { word: "storm", definition: "Very bad weather with wind and rain", example: "The storm was scary." },
        { word: "strong", definition: "Having a lot of power", example: "The wind was very strong." },
        { word: "fell", definition: "Past tense of fall", example: "The tree fell on the road." },
      ],
    },
    {
      id: "a2-hobbies",
      title: "My Hobbies",
      level: "a2",
      words: 220,
      content:
        "I have many hobbies that I enjoy in my free time. My favorite hobby is reading. I read books every evening before bed. I like adventure stories the most. My brother's hobby is different from mine. He likes playing the guitar. He practices every day and he is getting better. His music sounds nice now. My best friend Sarah loves dancing. She takes lessons twice a week. She is learning hip-hop and ballet. I also enjoy photography. I take photos of nature and animals. Last weekend, I took pictures of birds in the park. My mother says I am becoming a good photographer. Hobbies make life more interesting. Everyone should have at least one hobby.",
      comprehensionQs: [
        {
          question: "What is the writer's favorite hobby?",
          options: ["Playing guitar", "Reading", "Dancing", "Photography"],
          correct: 1,
        },
        {
          question: "What kind of stories does the writer like?",
          options: ["Love stories", "Adventure stories", "Funny stories", "Scary stories"],
          correct: 1,
        },
        {
          question: "How often does Sarah take dance lessons?",
          options: ["Once a week", "Twice a week", "Every day", "Once a month"],
          correct: 1,
        },
        {
          question: "What did the writer do last weekend?",
          options: ["Read a book", "Played guitar", "Took pictures of birds", "Went dancing"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "hobby", definition: "An activity you enjoy in your free time", example: "My hobby is reading." },
        { word: "guitar", definition: "A musical instrument with strings", example: "He plays the guitar." },
        { word: "photography", definition: "The art of taking pictures", example: "I like photography." },
        { word: "practice", definition: "To do something many times to improve", example: "She practices every day." },
        { word: "nature", definition: "The natural world of plants and animals", example: "I like to photograph nature." },
      ],
    },
    {
      id: "a2-city",
      title: "My City",
      level: "a2",
      words: 230,
      content:
        "I live in a small city. It is not as big as the capital, but I like it. There is a beautiful park in the center. People go there to relax and walk. There are also two museums and a library. The library is my favorite place. I go there every Saturday to borrow books. The city has a market every Sunday. You can buy fresh fruit, vegetables, and clothes there. The prices are lower than in the supermarket. The people in my city are friendly. Everyone says hello to each other. In the evening, the streets are quiet. It is much quieter than the big city. I think my city is a wonderful place to live. It is big enough to have everything you need but small enough to feel like home.",
      comprehensionQs: [
        {
          question: "What is there in the center of the city?",
          options: ["A museum", "A park", "A market", "A library"],
          correct: 1,
        },
        {
          question: "When does the writer go to the library?",
          options: ["Every Sunday", "Every Saturday", "Every Monday", "Every Friday"],
          correct: 1,
        },
        {
          question: "How are the prices at the market compared to the supermarket?",
          options: ["Higher", "The same", "Lower", "More expensive"],
          correct: 2,
        },
        {
          question: "What is the city like in the evening?",
          options: ["Very busy", "Noisy", "Quiet", "Dark"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "capital", definition: "The main city of a country", example: "The capital is very big." },
        { word: "museum", definition: "A place that shows historical objects", example: "We visited the museum." },
        { word: "library", definition: "A place where you can borrow books", example: "I borrow books from the library." },
        { word: "market", definition: "A place where people sell things", example: "We buy fruit at the market." },
        { word: "quiet", definition: "With little or no noise", example: "The street is quiet at night." },
        { word: "wonderful", definition: "Very good; excellent", example: "It is a wonderful place." },
      ],
    },
  ],
  b1: [
    {
      id: "b1-travel-story",
      title: "A Journey Abroad",
      level: "b1",
      words: 340,
      content:
        "Alex had always dreamed of visiting Japan. After saving money for two years, he finally booked his flight. He arrived at Narita Airport early in the morning. Everything looked different: the signs, the people, even the air smelled different. Alex felt excited but also a little nervous. He took a train to Tokyo. The city was huge and full of lights. During his first week, he visited temples, tried sushi for the first time, and got lost in the busy streets. He met a local named Yuki who spoke some English. Yuki showed him a small restaurant where they served the best ramen in the city. Alex learned a few Japanese phrases: 'arigato' for thank you and 'sumimasen' for excuse me. By the end of his trip, Alex felt more confident about traveling alone. He realized that making mistakes was part of the adventure. He promised himself he would visit again someday.",
      comprehensionQs: [
        {
          question: "How long did Alex save money for the trip?",
          options: ["One year", "Two years", "Three years", "Six months"],
          correct: 1,
        },
        {
          question: "How did Alex feel when he arrived?",
          options: ["Only excited", "Only nervous", "Excited but nervous", "Sad"],
          correct: 2,
        },
        {
          question: "Who showed Alex the best ramen restaurant?",
          options: ["A hotel worker", "A local named Yuki", "Another tourist", "His friend"],
          correct: 1,
        },
        {
          question: "What did Alex learn from his trip?",
          options: ["Japan is too expensive", "Making mistakes is part of the adventure", "Traveling alone is dangerous", "He does not like Japanese food"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "abroad", definition: "In or to a foreign country", example: "She traveled abroad for the first time." },
        { word: "booked", definition: "Reserved in advance", example: "He booked his flight online." },
        { word: "nervous", definition: "Worried or anxious", example: "She felt nervous before the exam." },
        { word: "temple", definition: "A building for religious worship", example: "They visited ancient temples." },
        { word: "phrases", definition: "Short groups of words", example: "I learned a few phrases in Japanese." },
        { word: "confident", definition: "Feeling sure about yourself", example: "He felt more confident after practice." },
        { word: "adventure", definition: "An exciting experience", example: "Traveling is an adventure." },
      ],
    },
    {
      id: "b1-environment",
      title: "Protecting the Environment",
      level: "b1",
      words: 360,
      content:
        "The environment is in trouble, and many people are looking for ways to help. Climate change has become one of the biggest challenges of our time. Scientists have warned that if we do not act quickly, the consequences will be severe. Rising temperatures have caused ice caps to melt and sea levels to rise. Many species have lost their natural habitats. However, positive changes have been made. Renewable energy is now used more than ever before. Solar panels and wind turbines can be found in many countries. People have also started to reduce their waste. Recycling programs have been introduced in most cities. If everyone makes small changes, a big difference can be achieved. Simple actions like using reusable bags, saving water, and planting trees can help protect the planet for future generations.",
      comprehensionQs: [
        {
          question: "What is one of the biggest challenges mentioned?",
          options: ["Pollution", "Climate change", "Deforestation", "Overpopulation"],
          correct: 1,
        },
        {
          question: "What has caused sea levels to rise?",
          options: ["More rain", "Rising temperatures", "Strong winds", "Earthquakes"],
          correct: 1,
        },
        {
          question: "What type of energy is now used more than ever?",
          options: ["Coal energy", "Nuclear energy", "Renewable energy", "Gas energy"],
          correct: 2,
        },
        {
          question: "What can be achieved if everyone makes small changes?",
          options: ["Nothing", "A big difference", "Immediate results", "More problems"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "climate change", definition: "Long-term changes in weather patterns", example: "Climate change affects everyone." },
        { word: "consequences", definition: "Results or effects of an action", example: "There are serious consequences." },
        { word: "habitat", definition: "The natural home of a plant or animal", example: "Forests are the habitat of many species." },
        { word: "renewable energy", definition: "Energy from sources that do not run out", example: "Solar power is a renewable energy source." },
        { word: "solar panels", definition: "Devices that convert sunlight into electricity", example: "Solar panels are on the roof." },
        { word: "recycling", definition: "Processing waste to make new products", example: "Recycling helps reduce waste." },
        { word: "generations", definition: "Groups of people born around the same time", example: "We must protect the planet for future generations." },
      ],
    },
    {
      id: "b1-job-interview",
      title: "The Job Interview",
      level: "b1",
      words: 330,
      content:
        "Anna had been looking for a job for three months. She had sent dozens of applications but had received very few replies. Finally, she was invited for an interview at a marketing company. She prepared carefully. She researched the company, practiced common questions, and chose her clothes the night before. On the day of the interview, she arrived fifteen minutes early. The interviewer, Mr. Thompson, was friendly but professional. He asked about her experience, her strengths, and why she wanted the job. Anna had prepared her answers well. She explained that she had worked on several projects during her studies. She also mentioned that she enjoyed working in a team. Mr. Thompson seemed impressed. At the end, he said they would contact her within a week. Anna left feeling hopeful. Three days later, she received an email. She got the job.",
      comprehensionQs: [
        {
          question: "How long had Anna been looking for a job?",
          options: ["One month", "Two months", "Three months", "Six months"],
          correct: 2,
        },
        {
          question: "What did Anna do to prepare for the interview?",
          options: ["Nothing special", "Researched the company and practiced", "Called the manager", "Wrote a new CV"],
          correct: 1,
        },
        {
          question: "How did Anna arrive for the interview?",
          options: ["Late", "On time", "Fifteen minutes early", "Thirty minutes early"],
          correct: 2,
        },
        {
          question: "When did Anna get the news about the job?",
          options: ["The same day", "After one week", "After three days", "After two weeks"],
          correct: 2,
        },
      ],
      vocabulary: [
        { word: "application", definition: "A formal request for a job", example: "She sent many applications." },
        { word: "interview", definition: "A formal meeting to assess someone for a job", example: "I have a job interview tomorrow." },
        { word: "research", definition: "To study something carefully", example: "She researched the company." },
        { word: "strengths", definition: "Things you are good at", example: "Communication is one of my strengths." },
        { word: "impressed", definition: "Feeling admiration for someone's work", example: "The manager was impressed." },
        { word: "hopeful", definition: "Feeling that something good will happen", example: "She felt hopeful after the interview." },
      ],
    },
    {
      id: "b1-health",
      title: "A Healthier Lifestyle",
      level: "b1",
      words: 350,
      content:
        "Mark had never thought much about his health. He ate fast food regularly, spent hours sitting at his desk, and rarely exercised. Last year, his doctor told him that his blood pressure was too high. Mark realized that if he did not change his habits, he would face serious health problems. He decided to make some changes. First, he started walking for thirty minutes every morning. Then he joined a gym and began lifting weights three times a week. He also changed his diet. He replaced sugary drinks with water and ate more vegetables. His friend, who had been exercising for years, gave him useful advice. After six months, Mark had lost ten kilograms and felt much better. His blood pressure had returned to normal. He has kept these habits ever since and feels healthier than ever before.",
      comprehensionQs: [
        {
          question: "What did Mark's doctor tell him?",
          options: ["He was too thin", "His blood pressure was too high", "He needed more sleep", "He should travel more"],
          correct: 1,
        },
        {
          question: "What was Mark's first change?",
          options: ["He joined a gym", "He started walking every morning", "He changed his diet", "He stopped eating fast food"],
          correct: 1,
        },
        {
          question: "How much weight did Mark lose in six months?",
          options: ["Five kilograms", "Eight kilograms", "Ten kilograms", "Twelve kilograms"],
          correct: 2,
        },
        {
          question: "Who gave Mark useful advice?",
          options: ["His doctor", "His friend", "His trainer", "His family"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "blood pressure", definition: "The force of blood against artery walls", example: "Exercise can lower blood pressure." },
        { word: "habits", definition: "Regular things you do", example: "He changed his eating habits." },
        { word: "diet", definition: "The food you usually eat", example: "A balanced diet is important." },
        { word: "exercise", definition: "Physical activity to stay fit", example: "I exercise three times a week." },
        { word: "advice", definition: "An opinion about what to do", example: "She gave me good advice." },
        { word: "kilograms", definition: "A unit for measuring weight", example: "He lost five kilograms." },
      ],
    },
    {
      id: "b1-tech",
      title: "How Technology Has Changed Our Lives",
      level: "b1",
      words: 370,
      content:
        "Technology has transformed the way we live, work, and communicate. Twenty years ago, people used paper maps to find their way. Today, GPS navigation is available on every smartphone. Letters have been replaced by emails and instant messages. Social media has made it possible to stay connected with friends across the world. In the workplace, many tasks that were once done by hand are now automated. However, technology has also created new challenges. People spend more time looking at screens than talking face to face. Privacy has become a major concern. Experts recommend that if we want to maintain a healthy relationship with technology, we should take regular breaks from our devices. Overall, technology has brought more benefits than problems, but it must be used wisely.",
      comprehensionQs: [
        {
          question: "What did people use to find their way twenty years ago?",
          options: ["Smartphones", "Paper maps", "GPS devices", "Compasses"],
          correct: 1,
        },
        {
          question: "What has replaced letters?",
          options: ["Phone calls", "Emails and instant messages", "Social media", "Video calls"],
          correct: 1,
        },
        {
          question: "What does the author recommend for a healthy relationship with technology?",
          options: ["Stop using it completely", "Take regular breaks from devices", "Use it only for work", "Spend more time online"],
          correct: 1,
        },
        {
          question: "What is the author's overall opinion of technology?",
          options: ["It has only problems", "It has more benefits than problems", "It is not important", "It should be avoided"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "transformed", definition: "Changed completely", example: "Technology transformed society." },
        { word: "GPS", definition: "A system that shows your location", example: "GPS helps you find directions." },
        { word: "social media", definition: "Websites and apps for social networking", example: "Social media connects people." },
        { word: "automated", definition: "Done by machines instead of people", example: "Many tasks are now automated." },
        { word: "privacy", definition: "The right to keep personal information secret", example: "Online privacy is important." },
        { word: "concern", definition: "A worry or problem", example: "Privacy is a growing concern." },
      ],
    },
    {
      id: "b1-culture",
      title: "Understanding Different Cultures",
      level: "b1",
      words: 340,
      content:
        "Traveling to a different country can be an eye-opening experience. Every culture has its own customs, traditions, and ways of thinking. In some cultures, it is polite to remove your shoes before entering a home. In others, bringing a gift to a dinner party is expected. Food also varies greatly from place to place. What is considered a delicacy in one country might seem unusual in another. If you want to avoid misunderstandings, it is important to learn about local customs before you travel. People who have lived abroad often say that understanding a new culture has changed their perspective on life. They have become more open-minded and tolerant. In a globalized world, cultural awareness is not just useful, it is essential.",
      comprehensionQs: [
        {
          question: "What is polite in some cultures before entering a home?",
          options: ["Knocking loudly", "Removing shoes", "Bringing a gift", "Greeting everyone"],
          correct: 1,
        },
        {
          question: "What might be considered unusual in one country?",
          options: ["Gifts", "What is a delicacy in another", "Polite behavior", "Traveling"],
          correct: 1,
        },
        {
          question: "What should you do to avoid misunderstandings?",
          options: ["Stay at home", "Learn about local customs", "Only visit tourist places", "Speak your own language"],
          correct: 1,
        },
        {
          question: "What is the main message of the text?",
          options: ["Travel is expensive", "Cultural awareness is essential", "All cultures are the same", "Food is the most important thing"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "customs", definition: "Traditional practices of a society", example: "Every country has its own customs." },
        { word: "traditions", definition: "Long-established ways of doing things", example: "We follow family traditions." },
        { word: "delicacy", definition: "A rare or expensive food", example: "This dish is a local delicacy." },
        { word: "misunderstanding", definition: "A failure to understand correctly", example: "Cultural differences can cause misunderstandings." },
        { word: "perspective", definition: "A particular way of seeing things", example: "Travel broadens your perspective." },
        { word: "tolerant", definition: "Willing to accept different views", example: "She is very tolerant of others." },
        { word: "globalized", definition: "Connected across the world", example: "We live in a globalized world." },
      ],
    },
  ],
  "b1+": [
    {
      id: "b1p-relationships",
      title: "Building Strong Relationships",
      level: "b1+",
      words: 420,
      content:
        "Sarah had been working at the same company for five years. She had always gotten along well with her colleagues, but recently something had changed. A new manager had been hired, and his communication style was very different from what she was used to. He had been giving her unclear instructions, and she had been feeling increasingly frustrated. She decided that she needed to have a conversation with him. She explained that she had been struggling to understand his expectations. The manager admitted that he had been under a lot of pressure and had not been communicating clearly. They agreed to have weekly check-ins. After that, their working relationship improved significantly. Sarah learned that honest communication is the foundation of any strong relationship, whether at work or in personal life.",
      comprehensionQs: [
        {
          question: "How long had Sarah been working at the company?",
          options: ["Two years", "Three years", "Five years", "Seven years"],
          correct: 2,
        },
        {
          question: "What had been causing Sarah's frustration?",
          options: ["Her salary", "Unclear instructions from her manager", "Long working hours", "Her colleagues"],
          correct: 1,
        },
        {
          question: "What did the manager admit?",
          options: ["He did not like Sarah", "He had been under pressure", "He was leaving", "He wanted to fire her"],
          correct: 1,
        },
        {
          question: "What did Sarah learn about relationships?",
          options: ["They are easy", "Honest communication is the foundation", "Work relationships are not important", "Managers are always right"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "colleague", definition: "A person you work with", example: "My colleague helped me with the project." },
        { word: "frustrated", definition: "Feeling annoyed because you cannot achieve something", example: "She felt frustrated by the delays." },
        { word: "expectations", definition: "What you believe will happen", example: "The manager explained his expectations." },
        { word: "check-in", definition: "A regular meeting to discuss progress", example: "We have weekly check-ins." },
        { word: "foundation", definition: "The basis on which something is built", example: "Trust is the foundation of friendship." },
        { word: "significantly", definition: "In an important way", example: "The situation improved significantly." },
      ],
    },
    {
      id: "b1p-city-life",
      title: "The Price of City Life",
      level: "b1+",
      words: 450,
      content:
        "Mark had been living in the city for over a decade. He had always loved the energy, the opportunities, and the endless activities. However, he had been noticing some changes that worried him. The cost of living had been rising steadily. His rent had increased by forty percent in just three years. His friends had been complaining about the same problem. Some of them had already moved to the suburbs. Mark had been thinking about moving too, but he was not sure. He loved his job, and he enjoyed being close to theaters and restaurants. He said that if he moved, he would miss the convenience of city life. After discussing it with his family, he decided to stay for another year and see how things developed. He hoped that the situation would improve.",
      comprehensionQs: [
        {
          question: "How long had Mark been living in the city?",
          options: ["Five years", "Eight years", "Over ten years", "Fifteen years"],
          correct: 2,
        },
        {
          question: "How much had Mark's rent increased in three years?",
          options: ["Twenty percent", "Thirty percent", "Forty percent", "Fifty percent"],
          correct: 2,
        },
        {
          question: "What had some of Mark's friends already done?",
          options: ["Changed jobs", "Moved to the suburbs", "Bought apartments", "Started businesses"],
          correct: 1,
        },
        {
          question: "What was Mark's final decision?",
          options: ["Move immediately", "Stay for another year", "Move to a different city", "Ask for a raise"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "decade", definition: "A period of ten years", example: "He has lived here for a decade." },
        { word: "cost of living", definition: "The amount of money needed to live", example: "The cost of living is high in cities." },
        { word: "rent", definition: "Money paid for using a property", example: "The rent is too expensive." },
        { word: "suburbs", definition: "Residential areas outside a city", example: "Many families move to the suburbs." },
        { word: "convenience", definition: "Ease and comfort", example: "I love the convenience of city life." },
      ],
    },
    {
      id: "b1p-traditions",
      title: "The Value of Tradition",
      level: "b1+",
      words: 430,
      content:
        "In a rapidly changing world, traditions can sometimes feel outdated. However, many people believe that traditions play an important role in our lives. Maria had been studying cultural anthropology for two years when she decided to research her own family traditions. She discovered that her grandmother had been baking the same holiday bread for over sixty years. The recipe had been passed down through four generations. Maria asked her grandmother to teach her. They spent an entire afternoon together, and Maria learned not just the recipe but also the stories behind it. Her grandmother explained that traditions connect us to our past and give us a sense of identity. Maria realized that traditions are not about doing things the old way. They are about preserving what matters most while adapting to the present.",
      comprehensionQs: [
        {
          question: "What had Maria been studying?",
          options: ["History", "Cultural anthropology", "Cooking", "Sociology"],
          correct: 1,
        },
        {
          question: "For how long had Maria's grandmother been baking the holiday bread?",
          options: ["Thirty years", "Forty years", "Over sixty years", "Fifty years"],
          correct: 2,
        },
        {
          question: "What did Maria learn besides the recipe?",
          options: ["New cooking techniques", "The stories behind it", "How to run a bakery", "Different types of bread"],
          correct: 1,
        },
        {
          question: "What do traditions do according to the text?",
          options: ["Make life harder", "Connect us to our past", "Prevent change", "Are only for old people"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "outdated", definition: "No longer useful or modern", example: "Some traditions may seem outdated." },
        { word: "anthropology", definition: "The study of human societies", example: "She studies cultural anthropology." },
        { word: "generations", definition: "Groups of people born around the same time", example: "The recipe has been in the family for generations." },
        { word: "recipe", definition: "Instructions for cooking a dish", example: "This is my grandmother's recipe." },
        { word: "identity", definition: "Who you are as a person", example: "Traditions shape our identity." },
        { word: "preserving", definition: "Keeping something from being lost", example: "We are preserving our cultural heritage." },
        { word: "adapting", definition: "Adjusting to new conditions", example: "Traditions must keep adapting." },
      ],
    },
    {
      id: "b1p-environment",
      title: "Taking Action for the Planet",
      level: "b1+",
      words: 460,
      content:
        "A group of students from Manchester had been working on an environmental project for six months. They had noticed that their school was producing too much waste. Plastic bottles, food wrappers, and paper were filling the bins every day. The students proposed a recycling program, but the school administration was not immediately convinced. The students explained that they had been researching other schools that had successfully reduced their waste. They presented data showing that recycling could save the school money. After several meetings, the administration finally agreed to support the initiative. The students set up recycling stations throughout the school. They also started a campaign to encourage everyone to use reusable water bottles. Within three months, the school had cut its waste by nearly half. The students said they were proud of what they had achieved and hoped other schools would follow their example.",
      comprehensionQs: [
        {
          question: "How long had the students been working on their project?",
          options: ["Three months", "Six months", "Nine months", "One year"],
          correct: 1,
        },
        {
          question: "What was the administration's initial reaction?",
          options: ["Fully supportive", "Not immediately convinced", "Strongly opposed", "Indifferent"],
          correct: 1,
        },
        {
          question: "What did the students set up throughout the school?",
          options: ["Gardens", "Recycling stations", "New classrooms", "Cafeterias"],
          correct: 1,
        },
        {
          question: "How much did the school's waste decrease in three months?",
          options: ["A quarter", "Nearly half", "About a third", "Almost all"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "producing", definition: "Creating or making something", example: "The factory is producing too much waste." },
        { word: "administration", definition: "The people who manage an organization", example: "The school administration agreed." },
        { word: "convinced", definition: "Made to believe something", example: "They were not convinced at first." },
        { word: "data", definition: "Facts and information", example: "They presented data to support their idea." },
        { word: "initiative", definition: "A new plan or project", example: "They launched a recycling initiative." },
        { word: "campaign", definition: "An organized effort to achieve a goal", example: "They started a campaign to reduce waste." },
      ],
    },
    {
      id: "b1p-social-media",
      title: "The Social Media Dilemma",
      level: "b1+",
      words: 440,
      content:
        "Emma had been using social media since she was thirteen. She had built a large following on Instagram and enjoyed sharing photos of her daily life. Recently, however, she had been feeling that social media was taking too much of her time. She calculated that she was spending over three hours a day scrolling through posts. She had also been comparing herself to others, which made her feel anxious. Her friend suggested that she take a break. Emma was reluctant at first. She was afraid that she would miss out on important news or lose touch with her friends. Nevertheless, she decided to try a one-week detox. She deleted the apps from her phone. The first few days were difficult. She found herself reaching for her phone out of habit. But by the end of the week, she felt more relaxed and focused. She said that the break had helped her realize what was truly important.",
      comprehensionQs: [
        {
          question: "How long had Emma been using social media?",
          options: ["Since she was ten", "Since she was thirteen", "Since she was fifteen", "Since she was eighteen"],
          correct: 1,
        },
        {
          question: "How much time was Emma spending on social media daily?",
          options: ["One hour", "Two hours", "Over three hours", "Five hours"],
          correct: 2,
        },
        {
          question: "What was Emma afraid of if she took a break?",
          options: ["Losing her phone", "Missing out or losing touch", "Getting bored", "Forgetting her password"],
          correct: 1,
        },
        {
          question: "How did Emma feel at the end of the week?",
          options: ["More anxious", "More relaxed and focused", "Bored", "Regretful"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "following", definition: "A group of followers on social media", example: "She has a large following." },
        { word: "scrolling", definition: "Moving through content on a screen", example: "He spent hours scrolling." },
        { word: "anxious", definition: "Feeling worried or nervous", example: "Social media made her anxious." },
        { word: "reluctant", definition: "Unwilling or hesitant", example: "She was reluctant to take a break." },
        { word: "detox", definition: "A period of abstaining from something", example: "She tried a social media detox." },
        { word: "habit", definition: "A regular repeated behavior", example: "Checking my phone is a habit." },
      ],
    },
    {
      id: "b1p-learning",
      title: "The Joy of Lifelong Learning",
      level: "b1+",
      words: 430,
      content:
        "David had been working as an accountant for fifteen years. He was good at his job, but he had been feeling that something was missing. He had always been interested in history, but he had never had the chance to study it properly. He decided to enroll in an online course about ancient civilizations. At first, he was worried that he would not have enough time. He was working full-time and had family responsibilities. However, he managed his schedule carefully. He studied for an hour every evening after dinner. He said that he had been learning more than he had expected. The course not only taught him about history, but also improved his critical thinking skills. He discovered that learning something new, even later in life, can be incredibly rewarding. David now plans to take another course next semester. He believes that learning should never stop.",
      comprehensionQs: [
        {
          question: "How long had David been working as an accountant?",
          options: ["Ten years", "Twelve years", "Fifteen years", "Twenty years"],
          correct: 2,
        },
        {
          question: "What subject did David decide to study?",
          options: ["Science", "Art", "History", "Technology"],
          correct: 2,
        },
        {
          question: "How much time did David study each day?",
          options: ["Thirty minutes", "One hour", "Two hours", "Three hours"],
          correct: 1,
        },
        {
          question: "What does David plan to do next semester?",
          options: ["Quit his job", "Take another course", "Travel", "Write a book"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "accountant", definition: "Someone who manages financial records", example: "He works as an accountant." },
        { word: "enroll", definition: "To sign up for a course", example: "She enrolled in a language class." },
        { word: "civilization", definition: "An advanced human society", example: "They studied ancient civilizations." },
        { word: "critical thinking", definition: "The ability to analyze and evaluate information", example: "The course improved her critical thinking." },
        { word: "rewarding", definition: "Giving satisfaction or pleasure", example: "Learning is incredibly rewarding." },
      ],
    },
  ],
  b2: [
    {
      id: "b2-innovation",
      title: "The Age of Innovation",
      level: "b2",
      words: 480,
      content:
        "We live in an era of unprecedented technological change. In the past twenty years, innovations have transformed nearly every aspect of our daily lives. Smartphones put the world's information in our pockets. Artificial intelligence can now diagnose diseases, compose music, and drive cars. Renewable energy technologies are reshaping how we power our homes and industries. However, with this rapid progress come significant challenges. Privacy concerns have become increasingly urgent as data collection grows more pervasive. The digital divide means not everyone benefits equally from these advances. Many workers face the prospect of automation replacing their jobs. Despite these challenges, human creativity continues to push boundaries. Scientists are developing quantum computers that could revolutionize medicine and materials science. Entrepreneurs are finding ways to combine profit with environmental sustainability. The question is not whether innovation will continue, but whether we can direct it wisely for the benefit of all humanity.",
      comprehensionQs: [
        {
          question: "What is the main topic of the text?",
          options: ["Environmental problems", "Technological innovation and its impacts", "Economic systems", "Medical advances"],
          correct: 1,
        },
        {
          question: "Which challenge of innovation is mentioned?",
          options: ["It is too expensive", "Privacy concerns and digital divide", "It moves too slowly", "People do not want new technology"],
          correct: 1,
        },
        {
          question: "What could quantum computers revolutionize?",
          options: ["Transportation", "Medicine and materials science", "Education", "Agriculture"],
          correct: 1,
        },
        {
          question: "What does the author suggest about the future of innovation?",
          options: ["It should be stopped", "It should be directed wisely", "It only benefits rich countries", "It is too dangerous"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "unprecedented", definition: "Never done or known before", example: "The change was unprecedented." },
        { word: "transformed", definition: "Changed completely", example: "Technology transformed our lives." },
        { word: "artificial intelligence", definition: "Computer systems that can perform human-like tasks", example: "AI is used in many fields." },
        { word: "renewable", definition: "Can be replaced naturally", example: "Solar energy is renewable." },
        { word: "pervasive", definition: "Widespread; present everywhere", example: "Data collection is pervasive." },
        { word: "digital divide", definition: "The gap between those with and without access to technology", example: "The digital divide affects education." },
        { word: "revolutionize", definition: "Change something completely", example: "The internet revolutionized communication." },
        { word: "sustainability", definition: "Ability to maintain over time without harming the environment", example: "Companies focus on sustainability." },
      ],
    },
    {
      id: "b2-psychology",
      title: "The Psychology of Habit Formation",
      level: "b2",
      words: 520,
      content:
        "Why do we find it so difficult to change our habits? This question has fascinated psychologists for decades. Research suggests that habits are deeply ingrained neural pathways. The brain, seeking efficiency, automates repeated behaviors so that it can conserve energy for other tasks. Had our ancestors not developed habits, they would have exhausted themselves making countless trivial decisions every day. The habit loop, as described by Charles Duhigg, consists of three elements: a cue, a routine, and a reward. Understanding this loop is essential if we are to change unwanted behaviors. Not until we identify the cue can we begin to replace the routine. For instance, if stress triggers the habit of eating junk food, the solution is not merely to resist the craving but to find a healthier reward that satisfies the same underlying need. Only by redesigning the loop can we achieve lasting change. The implications are profound: our habits shape our identity, and changing them requires not just willpower but a systematic understanding of how the mind works.",
      comprehensionQs: [
        {
          question: "What does the brain do to conserve energy?",
          options: ["Avoids thinking", "Automates repeated behaviors", "Slows down", "Increases blood flow"],
          correct: 1,
        },
        {
          question: "What are the three elements of the habit loop?",
          options: ["Trigger, action, result", "Cue, routine, reward", "Start, middle, end", "Thought, feeling, behavior"],
          correct: 1,
        },
        {
          question: "What must happen before we can replace the routine?",
          options: ["We must find more willpower", "We must identify the cue", "We must remove all triggers", "We must change our environment"],
          correct: 1,
        },
        {
          question: "What does the author say is needed to achieve lasting change?",
          options: ["Pure willpower", "A systematic understanding of the mind", "A strict schedule", "Support from others"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "ingrained", definition: "Firmly established and difficult to change", example: "Bad habits are deeply ingrained." },
        { word: "neural pathways", definition: "Connections between neurons in the brain", example: "Habits create strong neural pathways." },
        { word: "cue", definition: "A signal that triggers a behavior", example: "The cue for the habit is stress." },
        { word: "routine", definition: "A regular, repeated behavior", example: "The routine happens automatically." },
        { word: "reward", definition: "Positive reinforcement for a behavior", example: "The brain seeks the reward." },
        { word: "implications", definition: "Possible effects or consequences", example: "The implications of this research are significant." },
        { word: "profound", definition: "Very great or intense", example: "The change had a profound effect." },
      ],
    },
    {
      id: "b2-economics",
      title: "Understanding Market Behavior",
      level: "b2",
      words: 500,
      content:
        "Not until the 2008 financial crisis did the general public begin to question the assumptions underlying modern economic theory. For decades, economists had operated under the belief that markets were rational and self-correcting. Were it not for this conviction, deregulation might never have been pursued so aggressively. The crisis revealed something troubling: markets, it turns out, are driven not only by logic but also by emotion, herd mentality, and cognitive biases. Behavioral economics, pioneered by Daniel Kahneman and Amos Tversky, challenges the notion of the rational actor. Their research demonstrates that people consistently make decisions that defy traditional economic models. Under no circumstances should we assume that individuals always act in their best financial interest. Loss aversion, for example, causes people to fear losses more than they value equivalent gains. Had policymakers considered these psychological factors, they might have anticipated the housing bubble. Understanding the intersection of psychology and economics is no longer optional; it is essential for anyone who wishes to navigate the complexities of the modern financial world.",
      comprehensionQs: [
        {
          question: "What did the 2008 crisis reveal about markets?",
          options: ["They are always rational", "They are driven by emotion and biases too", "They are easy to predict", "They never fail"],
          correct: 1,
        },
        {
          question: "What concept does behavioral economics challenge?",
          options: ["Supply and demand", "The rational actor model", "Interest rates", "Global trade"],
          correct: 1,
        },
        {
          question: "What is loss aversion?",
          options: ["The desire to avoid losing things", "The love of money", "The fear of risk", "The habit of saving"],
          correct: 0,
        },
        {
          question: "What might have helped policymakers anticipate the housing bubble?",
          options: ["Stricter laws", "Considering psychological factors", "Higher taxes", "More data"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "deregulation", definition: "Removing government rules and restrictions", example: "Deregulation led to rapid growth." },
        { word: "herd mentality", definition: "Following the behavior of the crowd", example: "Herd mentality influenced the market." },
        { word: "cognitive bias", definition: "Systematic error in thinking", example: "Cognitive biases affect our decisions." },
        { word: "behavioral economics", definition: "Study of psychological effects on economic decisions", example: "Behavioral economics explains irrational choices." },
        { word: "loss aversion", definition: "Preferring to avoid losses over gaining equivalent rewards", example: "Loss aversion makes people reluctant to sell." },
        { word: "intersection", definition: "The point where two things meet", example: "The intersection of psychology and economics." },
      ],
    },
    {
      id: "b2-science",
      title: "The Frontiers of Modern Science",
      level: "b2",
      words: 540,
      content:
        "Nowhere is human curiosity more evident than in the realm of scientific discovery. Had the scientific method not been established during the Enlightenment, progress would have remained haphazard and slow. Today, research is pushing boundaries in fields that previous generations could scarcely have imagined. Consider genetics: the CRISPR-Cas9 gene-editing tool has given scientists the ability to modify DNA with unprecedented precision. Were it not for this technology, we would not be able to treat genetic disorders at their source. Meanwhile, physicists at CERN continue to probe the nature of reality itself, searching for particles that exist for only fractions of a second. Dark matter and dark energy, which together constitute ninety-five percent of the universe, remain among the greatest mysteries. Not until we develop new observational tools will we be able to fully understand them. The pace of discovery accelerates constantly, and with it comes the responsibility to use scientific knowledge ethically. Only by maintaining rigorous standards and open debate can we ensure that science serves humanity rather than endangering it.",
      comprehensionQs: [
        {
          question: "What did the scientific method provide during the Enlightenment?",
          options: ["Random discovery", "A systematic approach to progress", "Religious explanations", "Political freedom"],
          correct: 1,
        },
        {
          question: "What can CRISPR-Cas9 do?",
          options: ["Detect dark matter", "Modify DNA with precision", "Create energy", "Predict earthquakes"],
          correct: 1,
        },
        {
          question: "What percentage of the universe is dark matter and dark energy?",
          options: ["Fifty percent", "Seventy percent", "Ninety-five percent", "Ninety-nine percent"],
          correct: 2,
        },
        {
          question: "What does the author say is needed for science to serve humanity?",
          options: ["More funding", "Rigorous standards and open debate", "Faster discoveries", "More scientists"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "Enlightenment", definition: "An intellectual movement emphasizing reason and science", example: "The Enlightenment shaped modern science." },
        { word: "haphazard", definition: "Lacking order or planning", example: "Progress was haphazard before the scientific method." },
        { word: "CRISPR", definition: "A gene-editing technology", example: "CRISPR allows precise DNA modification." },
        { word: "DNA", definition: "The molecule carrying genetic information", example: "DNA determines inherited traits." },
        { word: "dark matter", definition: "Invisible matter that makes up most of the universe", example: "Dark matter cannot be seen directly." },
        { word: "ethical", definition: "Related to moral principles", example: "Scientific research must be ethical." },
      ],
    },
    {
      id: "b2-art",
      title: "Art as Social Commentary",
      level: "b2",
      words: 500,
      content:
        "Not since the Renaissance has art played such a powerful role in shaping public discourse. Contemporary artists are increasingly using their work to address social and political issues. Banksy, the anonymous street artist, has produced pieces that critique consumerism, war, and government surveillance. Had his work been displayed only in galleries, its impact would have been far more limited. By placing art in public spaces, he ensures that it reaches audiences who might never set foot in a museum. Rarely does traditional media provoke such immediate and visceral reactions. The power of art lies in its ability to communicate complex ideas without words. A single image can convey what paragraphs of text cannot. Artists today are also using digital platforms to distribute their work globally. However, this accessibility comes with challenges. In an age of information overload, capturing attention has become increasingly difficult. Only by creating work that is both meaningful and striking can artists hope to make a lasting impression. Art, at its best, does not merely decorate; it challenges, provokes, and inspires change.",
      comprehensionQs: [
        {
          question: "What does Banksy's art critique?",
          options: ["Nature and beauty", "Consumerism, war, and surveillance", "Technology and science", "Music and dance"],
          correct: 1,
        },
        {
          question: "Why does Banksy place art in public spaces?",
          options: ["It is cheaper", "To reach broader audiences", "To avoid taxes", "Because it is easier"],
          correct: 1,
        },
        {
          question: "What challenge do digital platforms present for artists?",
          options: ["They are too expensive", "Capturing attention is difficult", "They limit creativity", "They are illegal"],
          correct: 1,
        },
        {
          question: "What does art do at its best, according to the text?",
          options: ["Decorate spaces", "Challenge, provoke, and inspire change", "Entertain viewers", "Make money"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "discourse", definition: "Written or spoken communication about a topic", example: "Art plays a role in public discourse." },
        { word: "anonymous", definition: "With an unknown name or identity", example: "Banksy is an anonymous artist." },
        { word: "consumerism", definition: "The culture of buying goods", example: "His work critiques consumerism." },
        { word: "visceral", definition: "Relating to deep emotional feelings", example: "The art provoked a visceral reaction." },
        { word: "convey", definition: "To communicate an idea", example: "Images can convey complex ideas." },
        { word: "accessibility", definition: "The quality of being easy to reach or use", example: "Digital platforms increase accessibility." },
        { word: "provoke", definition: "To cause a reaction or feeling", example: "Good art should provoke thought." },
      ],
    },
    {
      id: "b2-society",
      title: "The Structure of Modern Society",
      level: "b2",
      words: 550,
      content:
        "Had the social structures of the past century remained unchanged, our daily lives would be unrecognizable. The transformation of society over the past fifty years has been nothing short of revolutionary. The rise of the internet, the globalization of trade, and shifting demographic patterns have fundamentally altered how we interact, work, and define ourselves. Under no circumstances should we underestimate the role of technology in reshaping social norms. Social media has redefined community, enabling connections that transcend geographical boundaries. Yet it has also contributed to polarization and the spread of misinformation. Not until we critically examine these forces can we hope to address the challenges they present. Meanwhile, demographic shifts are creating societies that are older and more diverse than ever before. Immigration has enriched cultures but also sparked debates about identity and belonging. Economic inequality continues to widen, raising questions about fairness and social mobility. Only through thoughtful policy and collective action can we build a society that is both prosperous and just. The stakes have never been higher.",
      comprehensionQs: [
        {
          question: "What has redefined community according to the text?",
          options: ["Traditional values", "Social media", "Government policy", "Education"],
          correct: 1,
        },
        {
          question: "What negative effect of social media is mentioned?",
          options: ["It is too expensive", "Polarization and misinformation", "It wastes time", "It reduces creativity"],
          correct: 1,
        },
        {
          question: "What demographic trend is described?",
          options: ["Younger population", "Older and more diverse society", "Population decline", "Rural migration"],
          correct: 1,
        },
        {
          question: "What does the author say is needed to build a just society?",
          options: ["More technology", "Thoughtful policy and collective action", "Stronger borders", "Less immigration"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "social structures", definition: "Patterns of relationships in society", example: "Social structures have changed over time." },
        { word: "globalization", definition: "The process of increasing global connection", example: "Globalization has transformed trade." },
        { word: "demographic", definition: "Relating to population characteristics", example: "Demographic trends affect the economy." },
        { word: "polarization", definition: "Division into opposing groups", example: "Social media can increase polarization." },
        { word: "misinformation", definition: "False or inaccurate information", example: "Misinformation spreads quickly online." },
        { word: "social mobility", definition: "The ability to move between social classes", example: "Education improves social mobility." },
      ],
    },
  ],
  "b2+": [
    {
      id: "b2p-business",
      title: "Navigating the Modern Business Landscape",
      level: "b2+",
      words: 680,
      content:
        "Having transformed nearly every sector of the economy, digital technology now demands that business leaders adapt or risk obsolescence. The traditional hierarchical model, characterized by top-down decision-making and rigid departmental silos, is proving increasingly inadequate in an era defined by rapid change and uncertainty. Successful organizations, recognizing the limitations of conventional structures, have embraced flatter hierarchies, cross-functional teams, and agile methodologies. This shift, driven by the need for faster innovation and greater responsiveness, represents a fundamental change in how work is organized and executed. Leaders are now expected to cultivate emotional intelligence, foster psychological safety, and empower employees rather than command them. The most effective executives understand that competitive advantage no longer stems solely from proprietary technology or economies of scale, but from the ability to attract, develop, and retain talent. Failure to prioritize employee well-being and professional growth inevitably leads to high turnover and diminished productivity. Simultaneously, businesses must navigate an increasingly complex regulatory environment, growing scrutiny regarding environmental and social impact, and the ever-present threat of disruption from agile startups. Having assessed these challenges, forward-thinking companies are investing in sustainable practices, diversifying their supply chains, and building cultures of continuous learning. Only those organizations willing to embrace change, challenge assumptions, and remain relentlessly focused on creating genuine value will thrive in the decades to come.",
      comprehensionQs: [
        {
          question: "What type of organizational structure is proving inadequate?",
          options: ["Flat structures", "The traditional hierarchical model", "Cross-functional teams", "Agile methodologies"],
          correct: 1,
        },
        {
          question: "What does competitive advantage now stem from?",
          options: ["Proprietary technology only", "Economies of scale only", "Attracting and retaining talent", "Government contracts"],
          correct: 2,
        },
        {
          question: "What happens when leaders fail to prioritize employee well-being?",
          options: ["Profits increase", "High turnover and diminished productivity", "Innovation accelerates", "Customers are happier"],
          correct: 1,
        },
        {
          question: "What will determine which organizations thrive?",
          options: ["Their size", "Embracing change and creating genuine value", "Their marketing budget", "How long they have existed"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "obsolescence", definition: "The state of becoming outdated or no longer useful", example: "Failing to innovate leads to obsolescence." },
        { word: "hierarchical", definition: "Organized in ranks or levels of authority", example: "The company has a hierarchical structure." },
        { word: "agile methodologies", definition: "Approaches to work emphasizing flexibility and iteration", example: "Agile methodologies improve responsiveness." },
        { word: "emotional intelligence", definition: "The ability to understand and manage emotions", example: "Leaders need emotional intelligence." },
        { word: "psychological safety", definition: "A culture where people feel safe to take risks", example: "Psychological safety encourages innovation." },
        { word: "economies of scale", definition: "Cost advantages gained through increased production", example: "Large companies benefit from economies of scale." },
        { word: "regulatory environment", definition: "The system of rules governing an industry", example: "Businesses must comply with the regulatory environment." },
        { word: "disruption", definition: "Fundamental change that displaces established systems", example: "Startups often create market disruption." },
      ],
    },
    {
      id: "b2p-politics",
      title: "The Dynamics of Political Power",
      level: "b2+",
      words: 720,
      content:
        "Having studied political systems across different eras and continents, one observes that power, irrespective of its form, tends to concentrate unless deliberately dispersed. The founding architects of modern democracies, drawing inspiration from Enlightenment thinkers such as Montesquieu and Locke, designed systems of checks and balances precisely to prevent this concentration. Their central insight, that separating power among distinct branches would safeguard liberty, remains the cornerstone of democratic governance. However, contemporary democracies face challenges their founders could not have anticipated. The rise of social media has fundamentally altered political communication, enabling direct engagement between leaders and citizens while simultaneously facilitating the spread of disinformation at unprecedented scale. Populist movements, capitalizing on economic anxiety and cultural dislocation, have gained traction across established democracies, challenging traditional party structures and policy consensus. Meanwhile, the growing influence of corporate lobbying and campaign finance raises questions about whether elected officials remain accountable to ordinary citizens or have become responsive primarily to wealthy donors. Having examined these trends, political scientists increasingly warn that democratic institutions are eroding, not because they have been overthrown, but because they have been gradually hollowed out. Reversing this trajectory requires not only legal reforms but also a renewed commitment to civic education and informed public discourse. Without an electorate capable of critical thought and resistant to manipulation, no system of government can long endure.",
      comprehensionQs: [
        {
          question: "What did the founders of modern democracies aim to prevent?",
          options: ["Economic growth", "Concentration of power", "Foreign influence", "Technological change"],
          correct: 1,
        },
        {
          question: "What has fundamentally altered political communication?",
          options: ["Television", "Social media", "Newspapers", "Public speeches"],
          correct: 1,
        },
        {
          question: "How are democratic institutions being eroded according to political scientists?",
          options: ["Through violent overthrow", "Through gradual hollowing out", "Through foreign invasion", "Through economic collapse"],
          correct: 1,
        },
        {
          question: "What does the author say is necessary to reverse the trajectory?",
          options: ["More laws only", "Legal reforms and renewed civic education", "Stronger leaders", "Less democracy"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "checks and balances", definition: "System preventing any branch from dominating", example: "The Constitution includes checks and balances." },
        { word: "cornerstone", definition: "The fundamental basis of something", example: "Freedom of speech is a cornerstone of democracy." },
        { word: "disinformation", definition: "False information deliberately spread to deceive", example: "Disinformation erodes public trust." },
        { word: "populist", definition: "Appealing to ordinary people against elites", example: "Populist movements have grown worldwide." },
        { word: "lobbying", definition: "Attempting to influence political decisions", example: "Corporate lobbying shapes legislation." },
        { word: "hollowed out", definition: "Weakened from within, appearing intact but empty", example: "Institutions have been hollowed out." },
        { word: "electorate", definition: "All the people entitled to vote", example: "An informed electorate is vital for democracy." },
      ],
    },
    {
      id: "b2p-philosophy",
      title: "The Questions That Define Us",
      level: "b2+",
      words: 700,
      content:
        "Having occupied human thought for over two millennia, philosophical inquiry continues to resist definitive answers, and perhaps this is precisely its value. Unlike the sciences, which accumulate knowledge progressively, philosophy returns again and again to the same fundamental questions: What constitutes a meaningful life? By what moral principles should we govern our actions? Is free will an illusion, or do we genuinely possess the capacity to choose? These questions, far from being abstract exercises, have profound practical implications. The ethical frameworks we adopt, whether consciously or unconsciously, shape our decisions regarding justice, relationships, and our responsibilities to future generations. Utilitarianism, which judges actions by their consequences, offers a compelling but incomplete picture, failing to account for individual rights that ought never to be violated. Deontological ethics, emphasizing duty and universal principles, provides necessary constraints but can prove inflexible in complex real-world situations. Virtue ethics, focusing on character rather than rules or outcomes, has experienced a renaissance in recent decades, its proponents arguing that the central moral question is not what we should do but what kind of person we should become. Having explored these competing traditions, one might conclude that no single framework suffices; wisdom lies in drawing judiciously from multiple sources. The willingness to hold such questions open, resisting premature certainty while continuing to engage seriously with competing arguments, may itself be the most essential philosophical disposition.",
      comprehensionQs: [
        {
          question: "How does philosophy differ from the sciences?",
          options: ["It is less important", "It returns to the same fundamental questions", "It has definitive answers", "It is only for academics"],
          correct: 1,
        },
        {
          question: "What limitation of utilitarianism is mentioned?",
          options: ["It is too complex", "It fails to account for individual rights", "It is too simple", "It ignores happiness"],
          correct: 1,
        },
        {
          question: "What does virtue ethics focus on?",
          options: ["Rules and duties", "Consequences of actions", "Character rather than rules or outcomes", "Social contracts"],
          correct: 2,
        },
        {
          question: "What does the author suggest is the most essential philosophical disposition?",
          options: ["Certainty", "Holding questions open and engaging with competing arguments", "Skepticism of everything", "Following one tradition"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "philosophical inquiry", definition: "The systematic examination of fundamental questions", example: "Philosophical inquiry challenges assumptions." },
        { word: "utilitarianism", definition: "Ethical theory judging actions by their consequences", example: "Utilitarianism seeks the greatest good." },
        { word: "deontological ethics", definition: "Ethical theory based on rules and duties", example: "Deontological ethics emphasizes moral duties." },
        { word: "virtue ethics", definition: "Ethical theory focusing on character and virtues", example: "Virtue ethics asks what kind of person to be." },
        { word: "renaissance", definition: "A revival or renewed interest", example: "Virtue ethics has experienced a renaissance." },
        { word: "judiciously", definition: "With good judgment and wisdom", example: "One must draw judiciously from multiple sources." },
        { word: "disposition", definition: "A person's inherent quality or tendency", example: "Open-mindedness is a valuable disposition." },
      ],
    },
    {
      id: "b2p-literature",
      title: "Literature and the Human Condition",
      level: "b2+",
      words: 650,
      content:
        "Having endured for millennia as one of humanity's most cherished art forms, literature retains its power to illuminate the human condition in ways that few other mediums can match. The novel, in particular, emerging as a dominant literary form in the eighteenth century, offered unprecedented opportunities for psychological depth and social commentary. Writers such as Jane Austen, Fyodor Dostoevsky, and Toni Morrison have, each in their distinct ways, used narrative fiction to explore the complexities of consciousness, the dynamics of power, and the depths of human suffering and resilience. Reading their work, one encounters not merely stories but entire worlds, constructed with sufficient detail and emotional truth that they continue to resonate across centuries and cultures. Literary analysis, far from being an elitist pursuit, cultivates essential cognitive capacities: the ability to inhabit perspectives different from one's own, to tolerate ambiguity, and to recognize the inadequacy of simple explanations for complex phenomena. Having considered the role of literature in an age dominated by visual media, one might worry that the habit of sustained reading is in decline. Yet the evidence suggests otherwise; despite competing demands on attention, millions of people continue to find in novels, poems, and plays a source of insight and solace that algorithms and streaming services cannot replicate. The endurance of literature, persisting through technological revolutions and cultural upheavals, testifies to an enduring human need for stories that speak to our deepest concerns.",
      comprehensionQs: [
        {
          question: "When did the novel emerge as a dominant literary form?",
          options: ["The sixteenth century", "The eighteenth century", "The twentieth century", "The medieval period"],
          correct: 1,
        },
        {
          question: "What cognitive capacity does literary analysis cultivate?",
          options: ["Memorization", "Speed reading", "Inhabiting different perspectives", "Mathematical reasoning"],
          correct: 2,
        },
        {
          question: "What concern does the author address about literature?",
          options: ["It is banned in some countries", "The habit of sustained reading may be in decline", "It is too expensive", "It is not translated well"],
          correct: 1,
        },
        {
          question: "What does the endurance of literature testify to?",
          options: ["People have too much free time", "An enduring human need for meaningful stories", "Education systems are effective", "Publishing is profitable"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "illuminate", definition: "To clarify or shed light on something", example: "Literature illuminates the human experience." },
        { word: "narrative fiction", definition: "Storytelling that invents characters and events", example: "Narrative fiction explores psychological depth." },
        { word: "resilience", definition: "The capacity to recover from difficulty", example: "The novel explores human resilience." },
        { word: "ambiguity", definition: "Uncertainty or lack of clear meaning", example: "Good literature embraces ambiguity." },
        { word: "solace", definition: "Comfort in times of sadness", example: "Many find solace in poetry." },
        { word: "cognitive capacities", definition: "Mental abilities such as thinking and reasoning", example: "Reading develops cognitive capacities." },
        { word: "endurance", definition: "The ability to last over time", example: "The endurance of literature is remarkable." },
      ],
    },
    {
      id: "b2p-persuasion",
      title: "The Art and Science of Persuasion",
      level: "b2+",
      words: 690,
      content:
        "Having studied the mechanisms of influence for decades, psychologists have identified recurring patterns that underlie effective persuasion, patterns that operate largely beneath conscious awareness. The principle of reciprocity, for instance, dictates that people feel compelled to return favors, a tendency so deeply ingrained that even unsolicited gifts can trigger a powerful sense of obligation. Scarcity, another well-documented principle, ensures that opportunities become more attractive as their availability diminishes. Marketers have long exploited this, employing limited-time offers and exclusive access to drive demand. Authority figures, meanwhile, command disproportionate influence; people defer to perceived experts even in domains where the expert holds no genuine expertise, a phenomenon famously demonstrated by Stanley Milgram's obedience experiments. Social proof, perhaps the most pervasive influence mechanism, causes individuals to look to others when determining appropriate behavior, a heuristic that generally serves us well but can lead to disastrous outcomes when the crowd is mistaken. Having examined these principles, one recognizes the ethical dimension inherent in any attempt to persuade. The same techniques employed by educators promoting public health can be weaponized by demagogues spreading propaganda. The distinction lies not in the mechanisms themselves but in the intentions behind their use and the transparency with which they are deployed. Persuasion, properly understood, is neither manipulative nor inherently virtuous; it is a tool, and like any powerful tool, its moral character depends entirely on the hands that wield it. Developing resistance to manipulation requires not cynicism but critical awareness of these psychological processes.",
      comprehensionQs: [
        {
          question: "What does the principle of reciprocity describe?",
          options: ["People return favors", "People want what is scarce", "People follow authority", "People copy others"],
          correct: 0,
        },
        {
          question: "What makes opportunities more attractive according to the text?",
          options: ["Higher quality", "Limited availability", "Lower price", "Better marketing"],
          correct: 1,
        },
        {
          question: "What did Milgram's experiments demonstrate?",
          options: ["People are kind", "People defer to authority figures", "People are independent", "People rarely obey"],
          correct: 1,
        },
        {
          question: "What does the author say is needed to resist manipulation?",
          options: ["Cynicism", "Critical awareness of psychological processes", "Avoiding all media", "Following experts"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "reciprocity", definition: "The practice of exchanging things with others", example: "Reciprocity is a powerful social norm." },
        { word: "scarcity", definition: "Limited availability of something", example: "Scarcity increases perceived value." },
        { word: "social proof", definition: "Following others' behavior to guide decisions", example: "Social proof influences consumer choices." },
        { word: "heuristic", definition: "A mental shortcut for quick decision-making", example: "Heuristics save mental effort." },
        { word: "demagogue", definition: "A leader who appeals to emotions and prejudices", example: "Demagogues exploit fear and anger." },
        { word: "propaganda", definition: "Information used to promote a political cause", example: "Propaganda distorts the truth." },
        { word: "transparency", definition: "Openness and clarity in communication", example: "Transparency builds trust." },
      ],
    },
    {
      id: "b2p-leadership",
      title: "Leadership in Complex Times",
      level: "b2+",
      words: 740,
      content:
        "Having studied leadership across organizational contexts, from corporate boardrooms to military commands to community movements, a clear pattern emerges: the most effective leaders are those who have cultivated self-awareness, intellectual humility, and the capacity to hold competing perspectives in tension. The traditional archetype of the heroic leader, possessing unwavering certainty and commanding authority, has proven ill-suited to navigating the complexity of modern challenges. Today's problems, characterized by interconnected systems, rapid change, and high uncertainty, demand a different approach. Adaptive leadership, a framework developed by Ronald Heifetz at Harvard, distinguishes between technical problems, which can be solved with existing expertise, and adaptive challenges, which require learning, experimentation, and shifts in values. The leader's task, confronted with an adaptive challenge, is not to provide answers but to ask the right questions, create conditions for collective problem-solving, and protect space for productive disagreement. Having observed leadership failures across sectors, one notes a recurring pattern: leaders who surround themselves with yes-sayers, who punish dissent, and who prioritize short-term results over long-term sustainability inevitably lead their organizations into crisis. Conversely, leaders who foster psychological safety, encourage diverse perspectives, and demonstrate willingness to admit error build cultures capable of weathering any storm. Leadership, properly understood, is not a position but a practice, available to anyone who chooses to take responsibility for mobilizing others toward a shared purpose. In an increasingly interdependent world, this conception of leadership, distributed rather than concentrated, collaborative rather than command-driven, offers the most promising path forward.",
      comprehensionQs: [
        {
          question: "What qualities do the most effective leaders cultivate?",
          options: ["Unwavering certainty", "Self-awareness and intellectual humility", "Commanding authority", "Aggressiveness"],
          correct: 1,
        },
        {
          question: "What does adaptive leadership distinguish between?",
          options: ["Good and bad leaders", "Technical problems and adaptive challenges", "Profit and loss", "Short-term and long-term goals"],
          correct: 1,
        },
        {
          question: "What pattern is observed in leadership failures?",
          options: ["Too much delegation", "Surrounding oneself with yes-sayers and punishing dissent", "Over-planning", "Being too cautious"],
          correct: 1,
        },
        {
          question: "How does the author define leadership?",
          options: ["A formal position", "A practice available to anyone", "An inherited trait", "A management technique"],
          correct: 1,
        },
      ],
      vocabulary: [
        { word: "intellectual humility", definition: "Awareness of the limits of one's own knowledge", example: "Intellectual humility enables learning." },
        { word: "archetype", definition: "A typical example or pattern", example: "The heroic leader is a familiar archetype." },
        { word: "adaptive leadership", definition: "Leadership focused on learning and addressing complex challenges", example: "Adaptive leadership embraces uncertainty." },
        { word: "technical problems", definition: "Problems solvable with existing knowledge", example: "Technical problems have known solutions." },
        { word: "adaptive challenges", definition: "Problems requiring learning and value shifts", example: "Adaptive challenges have no clear answers." },
        { word: "dissent", definition: "Disagreement or opposition", example: "Leaders should welcome productive dissent." },
        { word: "interdependent", definition: "Mutually dependent on each other", example: "Global systems are deeply interdependent." },
      ],
    },
  ],
};

export function getStoryById(id: string): Story | undefined {
  for (const level of Object.keys(storiesByLevel)) {
    const story = storiesByLevel[level].find((s) => s.id === id);
    if (story) return story;
  }
  return undefined;
}
