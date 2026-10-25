import React from 'react';

interface Props {
  onRestart: () => void;
}

const MEMORIES = [
  { src: '/memories/memory-01.jpg', caption: 'you, being you ♡', className: 'rotate-[-4deg] md:rotate-[-5deg]' },
  { src: '/memories/memory-02.jpg', caption: 'one of my favourites', className: 'rotate-[3deg] md:rotate-[4deg]' },
  { src: '/memories/memory-03.jpg', caption: 'this one made me smile', className: 'rotate-[2deg] md:rotate-[3deg]' },
  { src: '/memories/memory-04.jpg', caption: 'a little memory ♡', className: 'rotate-[-3deg] md:rotate-[-4deg]' },
];

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
        <div className="relative flex-1 overflow-hidden rounded-[18px] border border-[#9f3444]/70 bg-[#fffdf5] shadow-[10px_12px_0_rgba(130,48,61,0.10)]">
          {/* Paper */}
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(175,102,102,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(175,102,102,0.11)_1px,transparent_1px)] [background-size:27px_27px]" />
          <div className="absolute left-0 top-0 bottom-0 w-5 border-r border-[#d79a9a]/50 bg-[#f7d5cf]/80 md:w-7" />

          {/* Heading */}
          <div className="relative z-10 px-5 pt-5 text-center md:px-10 md:pt-6">
            <p className="font-hand text-[11px] uppercase tracking-[0.28em] text-[#a43b4d] md:text-sm">
              a little note, for you
            </p>
            <h1 className="mt-1 font-hand text-[clamp(2.5rem,5vw,4.8rem)] font-bold leading-[0.92] text-[#a5233d]">
              I wanted to tell you something...
            </h1>
            <div className="mx-auto mt-3 h-px w-24 bg-[#b64a58]/50" />
          </div>

          {/* Memory photos */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {MEMORIES.map((photo, index) => {
              const positions = [
                'left-[2.5%] top-[12%] md:left-[2.8%] md:top-[10%]',
                'right-[2.5%] top-[12%] md:right-[2.8%] md:top-[10%]',
                'left-[3%] bottom-[7%] md:left-[3.2%] md:bottom-[7%]',
                'right-[3%] bottom-[7%] md:right-[3.2%] md:bottom-[7%]',
              ];

              return (
                <figure
                  key={photo.src}
                  className={`absolute ${positions[index]} w-[25vw] max-w-[285px] min-w-[130px] md:w-[18vw] lg:w-[17vw] ${photo.className}`}
                >
                  <div className="rounded-[4px] bg-white p-2.5 pb-9 shadow-[0_10px_24px_rgba(70,30,35,0.18)] md:p-3 md:pb-10">
                    <div className="aspect-[4/5] overflow-hidden bg-[#f0e6dc]">
                      <img
                        src={photo.src}
                        alt="Memory"
                        className="h-full w-full object-cover"
                        loading="eager"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                    </div>
                    <figcaption className="absolute bottom-2 left-0 right-0 px-2 text-center font-hand text-sm text-[#9d4652] md:text-base">
                      {photo.caption}
                    </figcaption>
                  </div>
                </figure>
              );
            })}
          </div>

          {/* Letter */}
          <article className="relative z-10 mx-auto flex h-full max-w-[700px] flex-col justify-center px-[24%] pb-8 pt-8 text-center md:max-w-[760px] md:px-[20%] md:pb-10 md:pt-7 lg:px-[17%]">
            <div className="font-hand text-[clamp(1rem,1.35vw,1.28rem)] leading-[1.45] text-[#7f3c49]">
              <p>
                Some people enter your life without any plans,<br className="hidden md:block" />
                and somehow become a part of your thoughts.
              </p>

              <p className="mt-4">
                Maybe it&apos;s the conversations, the little moments,<br className="hidden md:block" />
                or simply the way you start looking forward to hearing from them.
              </p>

              <p className="mt-4">
                I never really knew what this was supposed to become.<br className="hidden md:block" />
                I just know that somewhere along the way,<br className="hidden md:block" />
                I started hoping there might be a little more to it.
              </p>

              <p className="mt-4 font-semibold text-[#a5233d]">
                So maybe this isn&apos;t really a question.<br />
                Maybe it&apos;s just a small hint...
              </p>

              <p className="mt-4">
                What if we stopped wondering where this could go<br className="hidden md:block" />
                and gave it a chance to find out?
              </p>

              <p className="mt-5 text-[clamp(1.05rem,1.5vw,1.4rem)] font-semibold text-[#a5233d]">
                — from someone who&apos;d like to find out with you ♡
              </p>
            </div>

            <p className="mt-3 font-hand text-xs tracking-[0.12em] text-[#b16a70] md:text-sm">
              keep this page somewhere safe
            </p>
          </article>
        </div>

        <div className="relative z-30 flex flex-col justify-center gap-3 px-4 pb-1 pt-3 sm:flex-row md:gap-5 md:pt-4">
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
