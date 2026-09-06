/* Questions Data & Customizer Store */
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "What is our most unforgettable memory? 🥹",
    options: [
      "A) Late night endless calls under the stars 🌌",
      "B) Laughing together until our stomachs hurt 😂",
      "C) That random cute spontaneous adventure 🚗",
      "D) All of the above (and every second spent with you) 💖"
    ],
    correctIndex: 3
  },
  {
    id: 2,
    question: "If anyone asks what makes Pragaaa so special, what's the answer? ✨",
    options: [
      "A) Her gorgeous warm smile ☀️",
      "B) Her kind and sweet heart 🌸",
      "C) Her hilarious cute energy ⚡",
      "D) Literally EVERYTHING about her 👑"
    ],
    correctIndex: 3
  },
  {
    id: 3,
    question: "What happens whenever you send a text or call? 📱",
    options: [
      "A) Immediate smile on the screen 😊",
      "B) Instant mood booster for the whole day 🚀",
      "C) Heart skips a little beat 🫠",
      "D) Absolutely all of these 💗"
    ],
    correctIndex: 3
  },
  {
    id: 4,
    question: "Who is the absolute favorite person who created this secret app for you? 🔐",
    options: [
      "A) Just anyone else",
      "B) Karuvapayaaa 🖤",
      "C) Gunduuu 💖",
      "D) Kunjuuuu 🥺"
    ],
    correctIndex: 2
  },
  {
    id: 5,
    question: "Are you ready to unlock your secret message now, Pragaaa? 💌",
    options: [
      "A) Yes! 💖",
      "B) Absolutely Yes! 💕",
      "C) Can't wait! 💘",
      "D) YES TO EVERYTHING! 🎉"
    ],
    correctIndex: 3
  }
];

const DEFAULT_SECRET_LINES = [
  "Dear Pragaaa, 🌷",
  "I could've simply typed this as a message...",
  "but you're far too special for an ordinary message.",
  "So I made you a tiny little secret. 💌",
  "You mean more to me than you probably realize.",
  "Thank you for being you. 🫶🏻",
  "And there's one more thing...",
  "Tap the heart ❤️"
];

const DEFAULT_FINAL_SURPRISE = {
  title: "SURPRISE, PRAGAAA! 🥹💗",
  message: "This little app was made just for you.",
  signature: "— From Gunduuu, who is very lucky to have you. 🌙"
};

const DEFAULT_STORY_DATA = {
  waitText: [
    "Wait...",
    "Something is coming for you... 👀"
  ],
  teaserHeader: "I have something to tell you...",
  teaserSub: "But words aren't enough. 🥺",
  teaserAction: "So I'll show you.",
  storySentences: [
    "It started with a simple moment... 🌱",
    "And somehow, you became someone really special to me. 🌷",
    "Someone whose presence can change an ordinary day. ☀️",
    "Someone I never want to take for granted. 🤍"
  ],
  memories: [
    { title: "Holding Hands Forever 🤝💖", img: "assets/photo_hands.png", caption: "Every time I hold your hand..." },
    { title: "Spontaneous Adventures 🌿🚗", img: "assets/photo_adventure.jpg", caption: "Lost in beautiful views with you..." },
    { title: "Our Best Smile & Thumbs Up 👍💗", img: "assets/photo_thumbsup.jpg", caption: "Always happy whenever I'm with you..." },
    { title: "Cute & Silly Moments 😜🫶🏻", img: "assets/photo_cute.png", caption: "Because you make every moment special..." },
    { title: "Sunlight & Bright Smiles ☀️✨", img: "assets/photo_rooftop.jpg", caption: "You bring so much light into my life..." }
  ],
  finalQuotePart1: "“And if you ever wonder what you mean to me...”",
  finalQuotePart2: "“You mean more than I know how to put into words.” 🥹💗",
  finalMessageBody: "Dear Gunduuu, 🌷\n\nHeyyy Gunduuu, epdiyo vanta en life la... ✨\nEnnaku unnkuda romba happy ah iruku Gunduuu. 🥹💗\n\nNeraiya sanda um varuthu...\nEnnaku puriyuthu na theva illama sanda podurenu,\naana nan apiditha Gunduuu, ennala fake pannika mudiyala. 🥺\n\nSanda poda kudathu, chinna visayathukulamm matured ah irukanum nenaipen... aana mudiyala.\nNe adjust panniko Gunduuu, atha matum! 🫶🏻\n\nAnd romba important aana visayam ennana:\n✨ \"Un Life La Na Illanalum Ne Happy Ah Nalla Iru Gunduuu\" ✨\n\nThank You For Loving Me! 💖",
  finalSignature: "— From me, to my Gunduuu 🌙",
  easterEggBtnText: "One last thing... 👀",
  easterEggMsg: "Okay okay... NOW you're allowed to smile. 😌💗"
};

class DataStore {
  constructor() {
    this.loadData();
  }

  loadData() {
    try {
      const savedQ = localStorage.getItem('praga_questions_v4');
      const savedL = localStorage.getItem('praga_secret_lines_v4');
      const savedF = localStorage.getItem('praga_final_surprise_v4');
      const savedS = localStorage.getItem('praga_story_data_v4');

      let parsedQ = savedQ ? JSON.parse(savedQ) : null;
      if (Array.isArray(parsedQ) && parsedQ.length > 0 && parsedQ.every(q => q && Array.isArray(q.options) && q.options.length > 0)) {
        this.questions = parsedQ;
      } else {
        this.questions = DEFAULT_QUESTIONS;
      }

      this.secretLines = (savedL && Array.isArray(JSON.parse(savedL))) ? JSON.parse(savedL) : DEFAULT_SECRET_LINES;
      this.finalSurprise = savedF ? { ...DEFAULT_FINAL_SURPRISE, ...JSON.parse(savedF) } : DEFAULT_FINAL_SURPRISE;
      this.storyData = savedS ? { ...DEFAULT_STORY_DATA, ...JSON.parse(savedS) } : DEFAULT_STORY_DATA;
      
      this.storyData.finalMessageBody = DEFAULT_STORY_DATA.finalMessageBody;
      this.storyData.finalSignature = DEFAULT_STORY_DATA.finalSignature;

      if (!this.storyData.memories || this.storyData.memories.some(m => m.img && m.img.includes('polaroid'))) {
        this.storyData.memories = DEFAULT_STORY_DATA.memories;
      }
    } catch (e) {
      this.questions = DEFAULT_QUESTIONS;
      this.secretLines = DEFAULT_SECRET_LINES;
      this.finalSurprise = DEFAULT_FINAL_SURPRISE;
      this.storyData = DEFAULT_STORY_DATA;
    }
  }

  saveData(questions, secretLines, finalSurprise, storyData) {
    this.questions = questions;
    this.secretLines = secretLines;
    this.finalSurprise = finalSurprise;
    this.storyData = storyData || DEFAULT_STORY_DATA;

    try {
      localStorage.setItem('praga_questions_v4', JSON.stringify(this.questions));
      localStorage.setItem('praga_secret_lines_v4', JSON.stringify(this.secretLines));
      localStorage.setItem('praga_final_surprise_v4', JSON.stringify(this.finalSurprise));
      localStorage.setItem('praga_story_data_v4', JSON.stringify(this.storyData));
    } catch(e) {
      console.warn("localStorage save failed", e);
    }
  }

  resetToDefault() {
    try {
      localStorage.removeItem('praga_questions_v4');
      localStorage.removeItem('praga_secret_lines_v4');
      localStorage.removeItem('praga_final_surprise_v4');
      localStorage.removeItem('praga_story_data_v4');
      localStorage.removeItem('praga_questions');
      localStorage.removeItem('praga_questions_v2');
      localStorage.removeItem('praga_questions_v3');
    } catch(e) {
      console.warn("localStorage reset failed", e);
    }
    this.loadData();
  }
}

const dataStore = new DataStore();
