import React from 'react';

interface Props {
  onRestart: () => void;
}

const MEMORIES = [
  { src: '/memories/memory-01.jpg', caption: 'you, being you ♡', rotate: '-3deg' },
  { src: '/memories/memory-02.jpg', caption: 'one of my favourites', rotate: '3deg' },
  { src: '/memories/memory-03.jpeg', caption: 'this one made me smile', rotate: '2deg' },
  { src: '/memories/memory-04.jpeg', caption: 'a little memory ♡', rotate: '-3deg' },
];

function MemoryCard({ src, caption, rotate }: { src: string; caption: string; rotate: string }) {
  return (
    <figure
      className="w-full max-w-[190px] justify-self-center"
      style={{ transform: `rotate(${rotate})` }}
    >
      <div className="rounded-[3px] bg-white p-2 pb-7 shadow-[0_8px_18px_rgba(70,30,35,0.18)] md:p-2.5 md:pb-8">
        <div className="aspect-[4/5] overflow-hidden bg-[#eee4d9]">
          <img
            src={src}
            alt="Memory"
            className="block h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <figcaption className="mt-1 text-center font-hand text-[12px] leading-tight text-[#9d4652] md:text-sm">
          {caption}
        </figcaption>
      </div>
    </figure>
  );
}

export default function SummaryScreen({ onRestart }: Props) {
  const sendMessage = async () => {
    const message = "I just finished your little date quest. That was actually really cute. I think we should give this a chance and pick a day to go out. :)";

    if (navigator.share) {
      try {
        await navigator.share({ title: 'A Little Date Quest', text: message });
        return;
      } catch {
        // User cancelled sharing; keep the page unchanged.
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      alert('Message copied to your clipboard ♡');
    } catch {
      alert(message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7c4c9] px-3 py-3 md:px-6 md:py-5 overflow-x-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#9f3444]/70 bg-[#fffdf5] shadow-[10px_12px_0_rgba(130,48,61,0.10)]">
          {/* Paper */}
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(175,102,102,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(175,102,102,0.11)_1px,transparent_1px)] [background-size:27px_27px]" />
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-5 border-r border-[#d79a9a]/50 bg-[#f7d5cf]/80 md:w-7" />

          {/* Header */}
          <header className="relative z-10 shrink-0 px-6 pb-2 pt-5 text-center md:px-10 md:pt-6">
            <p className="font-hand text-[9px] uppercase tracking-[0.28em] text-[#a43b4d] md:text-[11px]">
              a little note, for you
            </p>
            <h1 className="mx-auto mt-1 max-w-[850px] font-hand text-[clamp(2rem,3.8vw,3.7rem)] font-bold leading-[0.95] text-[#a5233d]">
              I wanted to tell you something...
            </h1>
            <div className="mx-auto mt-2 h-px w-16 bg-[#b64a58]/50" />
          </header>

          {/* Diary layout: two memories on each side, letter in the middle */}
          <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-5 px-7 pb-4 pt-2 md:grid-cols-[190px_minmax(0,1fr)_190px] md:gap-5 md:px-10 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:px-14">
            <div className="hidden min-h-0 flex-col justify-center gap-5 md:flex lg:gap-6">
              <MemoryCard {...MEMORIES[0]} />
              <MemoryCard {...MEMORIES[2]} />
            </div>

            <article className="flex min-h-0 items-center justify-center px-2 md:px-4 lg:px-8">
              <div className="w-full max-w-[650px] text-center font-hand text-[clamp(0.86rem,1.05vw,1.08rem)] leading-[1.34] text-[#7f3c49]">
                <p>
                  Some people enter your life without any plans,
                  <br className="hidden sm:block" />
                  and somehow become a part of your thoughts.
                </p>

                <p className="mt-3">
                  Maybe it&apos;s the conversations, the little moments,
                  <br className="hidden sm:block" />
                  or simply the way you start looking forward to hearing from them.
                </p>

                <p className="mt-3">
                  I never really knew what this was supposed to become.
                  <br className="hidden sm:block" />
                  I just know that somewhere along the way,
                  <br className="hidden sm:block" />
                  I started hoping there might be a little more to it.
                </p>

                <p className="mt-3 font-semibold text-[#a5233d]">
                  So maybe this isn&apos;t really a question.
                  <br />
                  Maybe it&apos;s just a small hint...
                </p>

                <p className="mt-3">
                  What if we stopped wondering where this could go
                  <br className="hidden sm:block" />
                  and gave it a chance to find out?
                </p>

                <p className="mt-3 text-[clamp(0.9rem,1.1vw,1.15rem)] font-semibold text-[#a5233d]">
                  — from someone who&apos;d like to find out with you ♡
                </p>

                <p className="mt-2 text-[9px] tracking-[0.12em] text-[#b16a70] md:text-[10px]">
                  keep this page somewhere safe
                </p>
              </div>
            </article>

            <div className="hidden min-h-0 flex-col justify-center gap-5 md:flex lg:gap-6">
              <MemoryCard {...MEMORIES[1]} />
              <MemoryCard {...MEMORIES[3]} />
            </div>

            {/* Small-screen memories */}
            <div className="grid grid-cols-2 gap-4 md:hidden">
              {MEMORIES.map((photo) => (
                <MemoryCard key={photo.src} {...photo} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-30 flex shrink-0 flex-col justify-center gap-3 px-4 pb-1 pt-3 sm:flex-row md:gap-5 md:pt-4">
          <button
            onClick={onRestart}
            className="min-h-12 flex-1 rounded-sm border-r-4 border-b-4 border-[#970f22] bg-[#ff6578] px-6 py-3 font-pixel text-sm text-white shadow-[0_5px_0_rgba(110,24,35,0.12)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 md:max-w-[390px] md:text-base"
          >
            ↻ PLAY AGAIN
          </button>
          <button
            onClick={sendMessage}
            className="min-h-12 flex-1 rounded-sm border-r-4 border-b-4 border-[#970f22] bg-[#ff6578] px-6 py-3 font-pixel text-sm text-white shadow-[0_5px_0_rgba(110,24,35,0.12)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 md:max-w-[390px] md:text-base"
          >
            ♡ SEND MESSAGE
          </button>
        </div>
      </div>
    </div>
  );
}
