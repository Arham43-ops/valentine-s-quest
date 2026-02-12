import React from 'react';
import { QUESTIONS } from './types';

interface Props {
  questionIndex: number;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
}

export default function QuestionPopup({ questionIndex, onAnswer }: Props) {
  const question = QUESTIONS[questionIndex];

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
          ❤️ {question.text}
        </h3>

        {/* Answer buttons */}
        <div className="flex flex-col gap-2">
          {question.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => onAnswer(questionIndex, i)}
              className="w-full bg-valentine-pink-light text-foreground font-pixel text-[8px] md:text-[9px] py-3 px-3 rounded-lg border-2 border-valentine-pink hover:bg-valentine-pink hover:text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 text-left"
            >
              {String.fromCharCode(97 + i)}) {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
