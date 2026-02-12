import React from 'react';
import { QUESTIONS } from './types';

interface Props {
  onRestart: () => void;
}

export default function SummaryScreen({ onRestart }: Props) {
  const getLetterContent = () => {
    return (
      <div className="space-y-4 text-[#8b0000] font-sans text-xs md:text-sm leading-relaxed tracking-tight">
        <p>
          Happy Valentine's Day! I've been thinking about how lucky I am to have you in my life, and I couldn't let today pass without telling you how much you mean to me.
        </p>

        <p>
          You have this incredible way of making everything brighter just by being yourself. Your laugh, your kindness, your little quirks—they all make my world so much better. I love how we can talk for hours or just sit together in silence, and it always feels right.
        </p>

        <p>
          Every day with you is a reminder of how wonderful love can be. You inspire me, you challenge me, and you make me feel more alive than I ever thought possible.
        </p>

        <p>
          Thank you for being my person, my comfort, and my joy. I hope this Valentine's Day reminds you how deeply you are loved, not just today, but every day.
        </p>

        <div className="pt-4 text-right flex flex-col items-end">
          <p className="font-pixel text-[8px] uppercase opacity-70">Forever yours,</p>
          <p className="font-pixel text-valentine-red text-xs mt-1">Your Valentine ❤️</p>
        </div>
      </div>
    );
  };

  const handleSendKiss = async () => {
    const text = `Sending you a million kisses! 💋💋💋\n\nI just finished our Valentine's Quest and catching your love letter was the best part. I love you! ❤️`;
    if (navigator.share) {
      await navigator.share({ title: "A Kiss for You", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('A million kisses have been copied to your clipboard! 💋');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#ffb3c1] overflow-hidden relative p-4 md:p-6">
      {/* Decorative Pixel Hearts at top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-4 text-xl opacity-80 pointer-events-none z-20">
        <span>💖</span><span>💝</span><span>💖</span>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-sm shadow-[8px_8px_0px_0px_rgba(139,0,0,0.15)] border-2 border-[#8b0000] relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Graph Paper Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        <div className="relative z-10 p-6 md:p-10 flex flex-col overflow-hidden">
          <header className="mb-6 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2 scale-75 md:scale-100">
              <span className="text-xl animate-bounce">💝</span>
              <span className="text-xl">💌</span>
              <span className="text-xl animate-bounce">💝</span>
            </div>
            <h2 className="font-pixel text-valentine-red text-base md:text-2xl tracking-wider text-center drop-shadow-sm">
              My Dearest Valentine
            </h2>
          </header>

          <article className="overflow-y-auto pr-2 custom-scrollbar">
            {getLetterContent()}
          </article>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-xl px-4 z-20">
        <button
          onClick={onRestart}
          className="flex-1 bg-[#ff6b81] hover:bg-[#ff4f69] text-white border-b-4 border-r-4 border-[#8b0000] py-3 px-6 rounded-sm font-pixel text-[10px] md:text-xs transition-all active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0 flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="text-sm">♥</span> REPLAY GAME
        </button>
        <button
          onClick={handleSendKiss}
          className="flex-1 bg-[#ff6b81] hover:bg-[#ff4f69] text-white border-b-4 border-r-4 border-[#8b0000] py-3 px-6 rounded-sm font-pixel text-[10px] md:text-xs transition-all active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0 flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="text-sm">💝</span> SEND A KISS
        </button>
      </div>

      {/* Footer Pixel Hearts */}
      <div className="mt-6 flex gap-3 text-lg opacity-80 animate-pulse">
        <span>❤️</span><span>💖</span><span>💕</span><span>💝</span><span>💞</span><span>❤️</span>
      </div>
    </div>
  );
}
