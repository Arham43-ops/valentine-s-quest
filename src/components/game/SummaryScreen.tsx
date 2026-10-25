import React, { useEffect, useState } from 'react';

interface Props { onRestart: () => void; }

const SOURCE_URL = 'https://raw.githubusercontent.com/Arham43-ops/valentine-s-quest/8da4e7b77e1e56a957f687dad77cb8e2e8b1cd42/src/components/game/SummaryScreen.tsx';
const EXTRA_PHOTO = `data:image/webp;base64,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`;

export default function SummaryScreen({ onRestart }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch(SOURCE_URL)
      .then((res) => res.text())
      .then((source) => {
        const found = [...source.matchAll(/const PHOTO_\d+\s*=\s*`(data:image\/[^`]+)`/g)].map((match) => match[1]);
        if (active) setPhotos(found.slice(0, 3));
      })
      .catch(() => { if (active) setPhotos([]); });
    return () => { active = false; };
  }, []);

  const handleSendMessage = async () => {
    const text = `I just finished your little date quest. That was actually really cute. I think we should give this a chance and pick a day to go out. :)`;
    if (navigator.share) {
      try { await navigator.share({ title: 'A Little Note', text }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('The message has been copied to your clipboard!');
    }
  };

  const frame = 'absolute overflow-hidden rounded-[3px] border-[7px] border-white bg-white shadow-[0_8px_18px_rgba(80,30,20,0.22)]';

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden bg-[#f7c6c9] px-3 py-3 md:px-6 md:py-4 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[1120px] flex-1 max-h-[735px] min-h-0">
        <div className="absolute inset-0 rounded-[8px] bg-[#d99b92]/35 translate-x-2 translate-y-3" />
        <main className="relative h-full overflow-hidden rounded-[8px] border border-[#8f302d] bg-[#fffdf5] shadow-[0_14px_30px_rgba(92,35,30,0.18)]" style={{ backgroundImage: 'linear-gradient(rgba(180,120,110,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(180,120,110,.09) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
          <div className="absolute left-0 top-0 bottom-0 w-[16px] bg-[#f0b6ae]/45 border-r border-[#dca39b]/40" />
          <div className="absolute left-[5%] top-[7%] rotate-[-8deg] text-2xl text-[#c06b67]/70">✦</div>
          <div className="absolute right-[6%] top-[8%] rotate-[8deg] text-2xl text-[#c06b67]/70">♡</div>
          <div className="absolute left-[6%] bottom-[8%] rotate-[10deg] text-xl text-[#c06b67]/55">☁︎</div>
          <div className="absolute right-[6%] bottom-[9%] rotate-[-8deg] text-xl text-[#c06b67]/55">✿</div>

          {photos[0] && <img src={photos[0]} alt="memory" className={`${frame} left-[3%] top-[7%] h-[145px] w-[92px] -rotate-[7deg] object-cover md:h-[180px] md:w-[112px]`} />}
          {photos[1] && <img src={photos[1]} alt="memory" className={`${frame} right-[3%] top-[8%] h-[155px] w-[96px] rotate-[7deg] object-cover md:h-[190px] md:w-[116px]`} />}
          {photos[2] && <img src={photos[2]} alt="memory" className={`${frame} left-[4%] bottom-[7%] h-[105px] w-[145px] rotate-[5deg] object-cover md:h-[125px] md:w-[175px]`} />}
          <img src={EXTRA_PHOTO} alt="memory" className={`${frame} right-[4%] bottom-[7%] h-[125px] w-[80px] -rotate-[6deg] object-cover md:h-[155px] md:w-[98px]`} />

          <div className="absolute left-[4%] top-[31%] rotate-[-5deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">you, being you ♡</div>
          <div className="absolute right-[4%] top-[32%] rotate-[4deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">one of my favourites</div>
          <div className="absolute left-[6%] bottom-[3%] rotate-[3deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">this one made me smile</div>
          <div className="absolute right-[4%] bottom-[3%] rotate-[-4deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">a little memory ♡</div>

          <section className="relative z-10 mx-auto flex h-full w-[64%] flex-col justify-center px-1 py-5 text-center md:w-[62%] md:px-4">
            <div className="mb-1 font-['Segoe_Print'] text-[9px] uppercase tracking-[0.28em] text-[#a25a52] md:text-[11px]">a little note, for you</div>
            <h1 className="font-['Segoe_Print'] text-[23px] font-bold leading-tight text-[#a72f42] md:text-[36px]">I wanted to tell you something...</h1>
            <div className="mx-auto my-2 h-px w-16 bg-[#c9857e]/70 md:my-3 md:w-20" />

            <div className="space-y-2 font-['Segoe_Print'] text-[10px] leading-[1.42] text-[#633b38] md:space-y-2.5 md:text-[13px] md:leading-[1.48]">
              <p>Some people enter your life without any plans,<br className="hidden md:block" /> and somehow become a part of your thoughts.</p>
              <p>Maybe it's the conversations, the little moments,<br className="hidden md:block" /> or simply the way you start looking forward to hearing from them.</p>
              <p>I never really knew what this was supposed to become.<br className="hidden md:block" /> I just know that somewhere along the way,<br className="hidden md:block" /> I started hoping there might be a little more to it.</p>
              <p className="font-semibold text-[#8e3b45]">So maybe this isn't really a question.<br />Maybe it's just a small hint...</p>
              <p>What if we stopped wondering where this could go<br className="hidden md:block" /> and gave it a chance to find out?</p>
            </div>

            <div className="mt-3 text-right font-['Segoe_Print'] text-[10px] text-[#8f514b] md:mt-4 md:text-sm">— from someone who'd like to find out with you ♡</div>
          </section>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-['Segoe_Print'] text-[8px] tracking-[0.18em] text-[#b87970] md:text-[10px]">keep this page somewhere safe</div>
        </main>
      </div>

      <div className="mt-2 flex w-full max-w-[660px] gap-3 md:mt-3 md:gap-4">
        <button onClick={onRestart} className="flex-1 rounded-[4px] border-b-4 border-r-4 border-[#8b0000] bg-[#ff6b81] py-2 px-3 font-pixel text-[9px] text-white shadow-lg transition-all hover:bg-[#ff4f69] active:translate-x-1 active:translate-y-1 active:border-b-0 active:border-r-0 md:py-2.5 md:text-xs">↻ PLAY AGAIN</button>
        <button onClick={handleSendMessage} className="flex-1 rounded-[4px] border-b-4 border-r-4 border-[#8b0000] bg-[#ff6b81] py-2 px-3 font-pixel text-[9px] text-white shadow-lg transition-all hover:bg-[#ff4f69] active:translate-x-1 active:translate-y-1 active:border-b-0 active:border-r-0 md:py-2.5 md:text-xs">♡ SEND MESSAGE</button>
      </div>
    </div>
  );
}
