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
    text: "If we had a free day together, how would you want to start it?",
    answers: ["Go out for Breakfast", "Grab Coffee & Walk Around", "Sleep In & Take It Easy"],
  },
  {
    text: "What kind of plan sounds most fun for us?",
    answers: ["Watch a Movie", "Go Somewhere New", "Just Drive & Talk", "Do Something Random"],
  },
  {
    text: "What should we do in the Evening?",
    answers: ["Go to a Nice Restaurant", "Go for a Walk", "Go for a Long Drive"],
  },
  {
    text: "Dinner should be:",
    answers: ["Cook Something Together", "Try a New Place", "Order Something & Chill", "Whatever You Pick"],
  },
  {
    text: "What kind of place would you enjoy going to?",
    answers: ["Café", "Restaurant", "Arcade / Bowling / Pool", "Somewhere Quiet"],
  },
  {
    text: "What would make this date feel like a really good one?",
    answers: ["Lots of Laughs", "Good Conversation", "Trying Something New", "Just Spending Quality Time"],
  },
];
