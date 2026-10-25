import React, { useEffect, useState } from 'react';

interface Props { onRestart: () => void; }

const SOURCE_URL = 'https://raw.githubusercontent.com/Arham43-ops/valentine-s-quest/8da4e7b77e1e56a957f687dad77cb8e2e8b1cd42/src/components/game/SummaryScreen.tsx';

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

          <div className="absolute left-[4%] top-[31%] rotate-[-5deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">you, being you ♡</div>
          <div className="absolute right-[4%] top-[32%] rotate-[4deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">one of my favourites</div>
          <div className="absolute left-[6%] bottom-[3%] rotate-[3deg] font-['Segoe_Print'] text-[9px] text-[#9a5a55] md:text-xs">this one made me smile</div>

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
