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
  facing: number; // 1 right, -1 left
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
    text: "How do we start our Valentine's Day?",
    answers: ["Go out for Breakfast", "Have Breakfast at Home", "Sleep Together"],
  },
  {
    text: "Which Movie Should we Watch?",
    answers: ["The Notebook", "La La Land", "Your Name", "10 Things I Hate About You"],
  },
  {
    text: "What should we do in Evening?",
    answers: ["Go to some fancy Restaurant", "Go to Park", "Go for a Ride"],
  },
  {
    text: "Dinner should be:",
    answers: ["Home Cooked Together", "Home cooked by someone else", "Restaurant Date", "Order in"],
  },
  {
    text: "Preferred Cuisine:",
    answers: ["Indian", "Chinese", "Italian", "You choose, I'll eat anything"],
  },
  {
    text: "Ideal evening activity:",
    answers: ["Cinema night", "Cyber cafe, Bowling, Pool..", "Long Talk + Quality Time"],
  },
];

export type GameStage = 'loading' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'summary';
