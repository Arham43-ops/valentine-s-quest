import React, { useEffect, useState } from 'react';
import { QUESTIONS } from './types';

interface Props {
  questionIndex: number;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
}

const ANSWER_REACTIONS: Record<string, string> = {
  'We Both Go To Somewhere': 'A shared start sounds good. ♡',
  'I Come To Pick You': 'Okay... I like that plan. ♡',
  'You Will Come By Yourself': 'Independent. I respect that.',
  'Watch a Movie': 'A cozy start. I like it.',
  'Go Somewhere New': "Now that's an adventure.",
  'Just Drive & Talk': 'That actually sounds pretty nice.',
  'Do Something Random': "I had a feeling you'd pick that.",
  'Go to a Nice Restaurant': 'Good choice. We should dress up a little.',
  'Go To Some Mall': 'Okay, mall day it is.',
  'Go To A Garden': 'A quiet evening sounds nice.',
  'Pool / Bowling / Arcade': 'Competitive date. Interesting...',
  'Café': 'Coffee and conversation? Noted.',
  'Restaurant': 'A proper dinner date. Noted.',
  'Somewhere Quiet': 'I like the sound of that.',
  'Lots of Laughs': "That's definitely the goal.",
  'Good Conversation': "Now that's important.",
  'Trying Something New': 'I like that answer.',
  'Just Spending Quality Time': "Honestly, that's the best one.",
  'Jewelry Items': 'Noted. Very carefully. 👀',
  'Makeup Stuff': 'Okay... noted. 👀',
  'Chocolates': 'That one was important. Definitely noted. 🍫',
};

export default function QuestionPopup({ questionIndex, onAnswer }: Props) {
  const question = QUESTIONS[questionIndex];
  const [reaction, setReaction] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setReaction(null);
    setLocked(false);
  }, [questionIndex]);

  const handleAnswer = (answerIndex: number) => {
    if (locked) return;

    const answer = question.answers[answerIndex];
    const nextReaction = ANSWER_REACTIONS[answer];

    if (!nextReaction) {
      onAnswer(questionIndex, answerIndex);
      return;
    }

    setLocked(true);
    setReaction(nextReaction);

    window.setTimeout(() => {
      onAnswer(questionIndex, answerIndex);
    }, 850);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
      <div className="bg-card border-4 border-valentine-red rounded-xl p-4 md:p-6 max-w-sm w-[90%] shadow-2xl animate-scale-in">
        {/* Question number badge */}
        <div className="flex justify-center mb-3">
          <span className="bg-valentine-gold text-foreground font-pixel text-[10px] px-3 py-1 rounded-md border-2 border-valentine-red">
            Q{questionIndex + 1}/6
          </span>
        </div>

        {/* Question text */}
        <h3 className="font-pixel text-valentine-red text-[10px] md:text-xs text-center mb-4 leading-relaxed">
          {question.text}
        </h3>

        {/* Answer buttons */}
        <div className="flex flex-col gap-2">
          {question.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={locked}
              className="w-full bg-valentine-pink-light text-foreground font-pixel text-[8px] md:text-[9px] py-3 px-3 rounded-lg border-2 border-valentine-pink hover:bg-valentine-pink hover:text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 text-left disabled:cursor-default disabled:hover:scale-100 disabled:opacity-70"
            >
              {String.fromCharCode(97 + i)}) {answer}
            </button>
          ))}
        </div>

        {/* Contextual reaction */}
        {reaction && (
          <div className="mt-3 rounded-lg border-2 border-valentine-gold bg-valentine-gold/20 px-3 py-2 text-center animate-scale-in">
            <p className="font-pixel text-[8px] leading-relaxed text-valentine-red">
              {reaction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
