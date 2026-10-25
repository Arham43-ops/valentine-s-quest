export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  type?: 'normal' | 'checkpoint' | 'yes' | 'no' | 'answer' | 'letter';
  label?: string;
  questionIndex?: number;
  answerIndex?: number;
  active?: boolean;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: number;
  jumps: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'heart' | 'sparkle';
}

export interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
}

export interface Question {
  text: string;
  answers: string[];
}

export const QUESTIONS: Question[] = [
  {
    text: "How Do You Want To Start The Date?",
    answers: ["We Both Go To Somewhere", "I Come To Pick You", "You Will Come By Yourself"],
  },
  {
    text: "What kind of plan sounds most fun for us?",
    answers: ["Watch a Movie", "Go Somewhere New", "Just Drive & Talk", "Do Something Random"],
  },
  {
    text: "What should we do in the Evening?",
    answers: ["Go to a Nice Restaurant", "Go To Some Mall", "Go To A Garden"],
  },
  {
    text: "What kind of place would you enjoy going to?",
    answers: ["Pool / Bowling / Arcade", "Café", "Restaurant", "Somewhere Quiet"],
  },
  {
    text: "What would make this date feel like a really good one?",
    answers: ["Lots of Laughs", "Good Conversation", "Trying Something New", "Just Spending Quality Time"],
  },
  {
    text: "What Do You Like The Most?",
    answers: ["Jewelry Items", "Makeup Stuff", "Chocolates"],
  },
];

export type GameStage = 'loading' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'transition' | 'summary';
