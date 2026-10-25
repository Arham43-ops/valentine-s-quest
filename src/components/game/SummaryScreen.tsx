import React, { useEffect, useState } from 'react';

interface Props {
  onRestart: () => void;
}

const SOURCE_URL = 'https://raw.githubusercontent.com/Arham43-ops/valentine-s-quest/50d6a0c7f6cd40f13de7c56e454020e9f9be7aaf/src/components/game/SummaryScreen.tsx';
const FALLBACK_PHOTO = 'data:image/webp;base64,UklGRqybAABXRUJQVlA4IKCbAAAwDASdASpqAkwEPnk6mUkkoysxIzKbEiAPCWdtfeFe/ba25del1iBF1nWnlhPrxwSl9BPsf+b19/QP9nyteX/3ndi6Ae/9oBeRR+580/7B/lunL/2PR6/Vv+f1Cv+nzGhvI/+ndP151WnDWZRc/f+/8cIP4d/5PPJ8e/x/+3w7/v91euTL4fxV8CPyT7GUjlxH7/Y4/7XoR+m/8Dzf/UfyzPvXqK+Tf/xefn88ICwCrGVrf4MRS/RIE9jgN6jwGq4L6/ygAAdrW5UOnss5Kvg7/BEZ5SZRqHwoheAlTVXRLAV7lkt8I+rKQCrs/1HTwtWMrcnxRMhYAHpksE18xRNR8zRY6ziiaRr5N5YO/IufebUk6n+nbWFfXxITeiCMYmB48D02kNa/M71Xu4ITbaGfpBJsoi/crMFOxF9Zjj8vQCY/xJ/0DKqGlZf9b7/EI6JcSp1MqHmwYqvSY4z3n7ecruh8fuwy1JyhDU6iP/mY0O3EkoH01zDxBTWh9pRjXwOD+Q6hszgdcaP8xONuBWDbBG/xC8K+0aVSJAtnq6W5Xgr1lPV8qi+OaYTrFPgLk8CcuijJWuWHW9/bG72oAzFHd+Uih/HD2NIgo4AeziNjSryZD7nV6cnbJtXzWj/IKPbWOQEH3+PE//RbwjDE2r61+4wMUuGMZYqyVP30Tdh9qeIC8Zl3gbfsIr2CI9LkBza6MPeQOrGlSnl9asD0kRC7KHpMHcEvm3LSdtCOWQs5xe2CPyJLTljazYvVJfRQaQhKdyWXsj4Cmbi/u5wuiiKHxgzqKh5Kqn6UB3ZUPLST134lkVXcQNlydf1SdItRpQl0VnGWjIbv/eCWNDV62s/CkrEQFUGxRi8jd3t3SeFBT9uKc/JBHWUgtY85ZP2E8dpw4vsVOZouCThQZF2vuw2G1E7RXKxnki1ttM4Ke93FZtNggSuEQ2UkvOCs/bYGQ44xBJE9dvXunQ6gqDGakZhLq4n6UbO/FEpJ1A1HvK5xwctwfwISzAKpi1DQSxtfMZXBUC+8k2uVDzg0Xf5VcY9+ftsJ8/mfVa7SKEcJF71wTQ6hBm6owa/vtwjtfax/r9/FJPcRz4K7uoM7uFEeRrOOxOhmJdMOUQTGGjyA5PAZEd4Gh8afXf2mauhe8+8zowfKnj8u3V34aUPutD0+wumPu4JLoGpQbUzD6eeyRJWu+3rSJnX+A953139z8q/HmqM6lr1SJsfuZMfYjj1cLffIKWLVmMR264Dt8wV9+QTIZLvBVgkctfk5apIQpE61RBxuq47oQ9hFCDAYmk8sOXErWueCtlJbsZXHNUkxF2+Xe/h68ie5MY6xMbfMJja4cFsKqiaotfRlUSkXn6eCzTkB+57ui7sLVir/pQNZC+WlDDwn9IXWEQ4wd/kmtIVRLVJ+sZIBcjzGSEfPKluH3bPf8EgB7R9NqN25nPCX9quYvbnFKMbaZsqWqmnLpgusr7dvsynsMDavL+E6Q4VEhGZ8aFOIseJEeCuX3gHVPIE+9q6owt/nTtL+cVPKEE+74vJ2UGg6G8gK1Klb7OwowUZ2lnjX1usY/MRPp6/kYFlWn04/kMg0zQBOyxH8M61LRtcaDvmPwAt591ljV8sCivpKHmpomEh84hch6z1o4cjZZlWFzqfRV3gjkeqrsSQVzGgc2ZJB2GMWP1q/A8Y8btPCCDYz9HB2/yM+/pF1Xg7k+MoHdRpKwxU8LqJmsuUC5rFtKGbVgIv3o00/FLyTH5ULs3495+tZEFTqYlDGaFCLEaL+hEyMwze1ggioXOtODO6K341W76rwHvy7ZKvKW9p3Ti+ekL6CHwNT2nOEFqkPyF44YI/DIjCR4dXZrRpHacJ';

export default function SummaryScreen({ onRestart }: Props) {
  const [photos, setPhotos] = useState<string[]>([FALLBACK_PHOTO, FALLBACK_PHOTO, FALLBACK_PHOTO, FALLBACK_PHOTO]);

  useEffect(() => {
    let alive = true;
    fetch(SOURCE_URL)
      .then((r) => r.text())
      .then((source) => {
        const found = source.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g) ?? [];
        if (alive && found.length >= 4) setPhotos(found.slice(0, 4));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const handleSendMessage = async () => {
    const text = `I just finished your little date quest. That was actually really cute. I think we should give this a chance and pick a day to go out. :)`;
    if (navigator.share) {
      try { await navigator.share({ title: 'A Little Note', text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); alert('The message has been copied to your clipboard!'); }
      catch { alert(text); }
    }
  };

  const photoCard = 'absolute rounded-[4px] border-[9px] border-white bg-white p-1 shadow-[0_16px_30px_rgba(80,30,20,0.24)]';
  const photoImage = 'block w-full bg-[#f8f2e9] object-contain';

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden bg-[#f6c4c8] px-2 py-3 sm:px-4 sm:py-4 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[1450px] h-[min(88dvh,820px)] min-h-[640px]">
        <div className="absolute inset-0 translate-x-2 translate-y-3 rounded-[10px] bg-[#d99b92]/30" />
        <main className="relative h-full overflow-hidden rounded-[10px] border border-[#8f302d] bg-[#fffdf5] shadow-[0_16px_34px_rgba(92,35,30,0.18)]" style={{ backgroundImage: 'linear-gradient(rgba(180,120,110,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(180,120,110,.09) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
          <div className="absolute inset-y-0 left-0 w-[18px] border-r border-[#dca39b]/40 bg-[#f0b6ae]/45" />
          <div className="absolute left-[8%] top-[8%] text-2xl text-[#c06b67]/55 rotate-[-10deg]">✦</div>
          <div className="absolute right-[8%] top-[10%] text-2xl text-[#c06b67]/55 rotate-[8deg]">♡</div>
          <div className="absolute left-[9%] bottom-[10%] text-xl text-[#c06b67]/45 rotate-[8deg]">☁︎</div>
          <div className="absolute right-[9%] bottom-[9%] text-xl text-[#c06b67]/45 rotate-[-8deg]">✿</div>

          <figure className={`${photoCard} left-[1%] top-[3%] w-[120px] sm:left-[2.5%] sm:top-[4%] sm:w-[215px] md:w-[245px] lg:w-[270px] xl:w-[285px] -rotate-[5deg]`}>
            <img src={photos[0]} alt="Memory" className={`${photoImage} aspect-[4/5]`} />
            <figcaption className="px-1 pb-1 pt-2 text-center font-hand text-[14px] leading-tight text-[#a6534f] sm:text-[16px]">you, being you ♡</figcaption>
          </figure>

          <figure className={`${photoCard} right-[1%] top-[3.5%] w-[120px] sm:right-[2.5%] sm:top-[4.5%] sm:w-[215px] md:w-[245px] lg:w-[270px] xl:w-[285px] rotate-[5deg]`}>
            <img src={photos[1]} alt="Memory" className={`${photoImage} aspect-[4/5]`} />
            <figcaption className="px-1 pb-1 pt-2 text-center font-hand text-[14px] leading-tight text-[#a6534f] sm:text-[16px]">one of my favourites</figcaption>
          </figure>

          <figure className={`${photoCard} left-[1%] bottom-[3%] w-[135px] sm:left-[2.8%] sm:bottom-[4%] sm:w-[235px] md:w-[270px] lg:w-[300px] xl:w-[320px] rotate-[4deg]`}>
            <img src={photos[2]} alt="Memory" className={`${photoImage} aspect-[4/3]`} />
            <figcaption className="px-1 pb-1 pt-2 text-center font-hand text-[14px] leading-tight text-[#a6534f] sm:text-[16px]">this one made me smile</figcaption>
          </figure>

          <figure className={`${photoCard} right-[1%] bottom-[3%] w-[120px] sm:right-[2.8%] sm:bottom-[4%] sm:w-[210px] md:w-[235px] lg:w-[255px] xl:w-[270px] -rotate-[4deg]`}>
            <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-[#f8f2e9]"><img src={photos[3]} alt="Memory" className="block h-[132%] w-[132%] max-w-none rotate-90 object-contain" /></div>
            <figcaption className="px-1 pb-1 pt-2 text-center font-hand text-[14px] leading-tight text-[#a6534f] sm:text-[16px]">a little memory ♡</figcaption>
          </figure>

          <section className="absolute inset-x-[22%] top-[5%] bottom-[6%] sm:inset-x-[23%] flex flex-col items-center justify-center text-center">
            <p className="font-hand text-[12px] tracking-[0.32em] text-[#b7655e] sm:text-[14px]">A LITTLE NOTE, FOR YOU</p>
            <h1 className="mt-2 font-hand text-[36px] font-bold leading-[1.05] text-[#9e2739] sm:text-[44px] md:text-[54px] lg:text-[62px]">I wanted to tell you something...</h1>
            <div className="my-3 h-px w-20 bg-[#dca39b]" />
            <div className="max-w-[680px] font-hand text-[16px] leading-[1.3] text-[#7b4540] sm:text-[18px] md:text-[20px]">
              <p>Some people enter your life without any plans,<br className="hidden sm:block" />and somehow become a part of your thoughts.</p>
              <p className="mt-3">Maybe it's the conversations, the little moments,<br className="hidden sm:block" />or simply the way you start looking forward to hearing from them.</p>
              <p className="mt-3">I never really knew what this was supposed to become.<br className="hidden sm:block" />I just know that somewhere along the way,<br className="hidden sm:block" />I started hoping there might be a little more to it.</p>
              <p className="mt-4 font-semibold text-[#9e2739]">So maybe this isn't really a question.<br />Maybe it's just a small hint...</p>
              <p className="mt-4">What if we stopped wondering where this could go<br className="hidden sm:block" />and gave it a chance to find out?</p>
            </div>
            <div className="mt-5 font-hand text-[17px] font-semibold text-[#9e2739] sm:text-[20px]">— from someone who'd like to find out with you ♡</div>
            <p className="mt-2 font-hand text-[12px] tracking-[0.12em] text-[#b7655e]/80 sm:text-[14px]">keep this page somewhere safe</p>
          </section>
        </main>
      </div>

      <div className="mt-3 flex w-full max-w-[860px] gap-3 px-1 sm:mt-4 sm:gap-5">
        <button onClick={onRestart} className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-[3px] border-b-4 border-r-4 border-[#8f0008] bg-[#ff6476] px-3 font-pixel text-[11px] text-white shadow-[0_5px_10px_rgba(120,20,20,0.18)] transition hover:brightness-105 active:translate-y-1 active:border-b-2 sm:h-[50px] sm:text-sm">↻ <span>PLAY AGAIN</span></button>
        <button onClick={handleSendMessage} className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-[3px] border-b-4 border-r-4 border-[#8f0008] bg-[#ff6476] px-3 font-pixel text-[11px] text-white shadow-[0_5px_10px_rgba(120,20,20,0.18)] transition hover:brightness-105 active:translate-y-1 active:border-b-2 sm:h-[50px] sm:text-sm">♡ <span>SEND MESSAGE</span></button>
      </div>
    </div>
  );
}
