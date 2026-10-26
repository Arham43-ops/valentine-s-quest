import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audioManager } from './AudioManager';
import { Player, Platform, Particle, Cloud, QUESTIONS, GameStage } from './types';
import { drawBackground, drawCloud, drawGround, drawPlatform, drawPlayer, drawParticle, drawLetter } from './renderer';
import SummaryScreen from './SummaryScreen';
import QuestionPopup from './QuestionPopup';

const GRAVITY = 0.35;
const JUMP_FORCE = -8.5;
const MOVE_SPEED = 2.5;
const PLAYER_W = 28;
const PLAYER_H = 32;

function createClouds(count: number, worldW: number, canvasH: number): Cloud[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * worldW,
    y: 30 + Math.random() * (canvasH * 0.4),
    w: 40 + Math.random() * 60,
    speed: 0.2 + Math.random() * 0.3,
  }));
}

function spawnParticles(x: number, y: number, count: number, type: 'heart' | 'sparkle' = 'heart'): Particle[] {
  const colors = ['#FF1493', '#FF69B4', '#DC143C', '#FFD700', '#FF85C8'];
  return Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 6,
    vy: -Math.random() * 5 - 2,
    life: 60 + Math.random() * 40,
    maxLife: 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    type,
  }));
}

function getQuestionPlatforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 350;
  for (let q = 0; q < QUESTIONS.length; q++) {
    const baseX = 250 + q * spacing;
    if (q > 0) {
      platforms.push({ x: baseX - spacing / 2 - 40, y: H - 140, w: 80, h: 20, color: '#FF69B4' });
    }
    platforms.push({
      x: baseX,
      y: H - 160,
      w: 60,
      h: 40,
      color: '#FFD700',
      type: 'checkpoint',
      label: '?',
      questionIndex: q,
      active: q === 0,
    });
  }
  return platforms;
}

function getAnswerPlatforms(H: number, W: number): Platform[] {
  const centerX = W / 2;
  const noX = Math.max(30, centerX - 340);
  const yesX = Math.min(W - 170, centerX + 170);
  const platformY = H - 180;
  const lowerY = H - 120;

  return [
    { x: noX, y: platformY, w: 140, h: 30, color: '#888', type: 'no', label: 'NO' },
    { x: yesX, y: platformY, w: 140, h: 30, color: '#FF1493', type: 'yes', label: 'YES ♥' },
    { x: noX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },
    { x: yesX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },
  ];
}

function getLetterPlatforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 320;
  for (let i = 0; i < 11; i++) {
    platforms.push({ x: 200 + i * spacing, y: H - 150 - Math.sin(i * 0.5) * 120, w: 120, h: 20, color: '#FF69B4' });
  }
  platforms.push({ x: 650, y: H - 160, w: 32, h: 24, type: 'letter' });
  return platforms;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<GameStage>('loading');
  const [muted, setMuted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [replayMode, setReplayMode] = useState(false);

  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<Player>({ x: 60, y: 300, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, onGround: false, facing: 1, jumps: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const cameraXRef = useRef(0);
  const frameRef = useRef(0);
  const stageRef = useRef<GameStage>('loading');
  const answersRef = useRef<string[]>([]);
  const currentQRef = useRef(0);
  const noPlatRef = useRef<Platform | null>(null);
  const celebrationRef = useRef(false);
  const activeQuestionRef = useRef<number | null>(null);
  const touchRef = useRef({ left: false, right: false, jump: false });
  const answeredQsRef = useRef<Set<number>>(new Set());
  const gamePausedRef = useRef(false);
  const finalTransitionRef = useRef(false);

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { currentQRef.current = currentQ; }, [currentQ]);
  useEffect(() => { celebrationRef.current = celebration; }, [celebration]);
  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
    gamePausedRef.current = activeQuestion !== null;
  }, [activeQuestion]);

  const initStage = useCallback((s: GameStage) => {
    const p = playerRef.current;
    const W = canvasRef.current?.width || window.innerWidth;
    const H = canvasRef.current?.height || window.innerHeight;
    p.x = s === 'stage2' ? Math.max(0, W / 2 - p.w / 2) : 60;
    p.y = s === 'stage2' ? H - 40 - p.h : 300;
    p.vx = 0; p.vy = 0; p.onGround = s === 'stage2'; p.jumps = 0;
    cameraXRef.current = 0;
    particlesRef.current = [];
    answeredQsRef.current = new Set();
    gamePausedRef.current = false;
    finalTransitionRef.current = false;
    setActiveQuestion(null);

    if (s === 'stage3') {
      platformsRef.current = getQuestionPlatforms(H);
      noPlatRef.current = null;
      cloudsRef.current = createClouds(15, 2500, H);
      setCurrentQ(0);
    } else if (s === 'stage2') {
      platformsRef.current = getAnswerPlatforms(H, W);
      noPlatRef.current = platformsRef.current.find(p => p.type === 'no') || null;
      cloudsRef.current = createClouds(6, W, H);
    } else if (s === 'stage4') {
      platformsRef.current = getLetterPlatforms(H);
      noPlatRef.current = null;
      cloudsRef.current = createClouds(20, 4000, H);
    }
    setStage(s);
  }, []);

  const handleStartGame = useCallback(() => {
    audioManager.init();
    audioManager.startBgMusic();
    initStage('stage3');
  }, [initStage]);

  const handleAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    const fullAnswer = QUESTIONS[questionIndex].answers[answerIndex];
    audioManager.playCollect();
    answeredQsRef.current.add(questionIndex);
    setAnswers(prev => {
      const next = [...prev, fullAnswer];
      answersRef.current = next;
      return next;
    });
    setActiveQuestion(null);

    if (questionIndex === QUESTIONS.length - 1) {
      audioManager.playRomanticFinale();
      particlesRef.current.push(...spawnParticles(400, 200, 30));
      setTimeout(() => initStage('stage2'), 900);
    } else {
      const nextQ = questionIndex + 1;
      setCurrentQ(nextQ);
      currentQRef.current = nextQ;
      platformsRef.current.forEach(p => {
        if (p.questionIndex === nextQ) p.active = true;
      });
    }
  }, [initStage]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const H = canvas.height;
      const W = canvas.width;
      if (stage === 'stage2') {
        const nextPlatforms = getAnswerPlatforms(H, W);
        platformsRef.current = nextPlatforms;
        noPlatRef.current = nextPlatforms.find(p => p.type === 'no') || null;
      } else if (stage === 'stage3') {
        platformsRef.current = getQuestionPlatforms(H);
      } else if (stage === 'stage4') {
        platformsRef.current = getLetterPlatforms(H);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    audioManager.init();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      frameRef.current++;
      const W = canvas.width;
      const H = canvas.height;
      const p = playerRef.current;
      const keys = keysRef.current;
      const touch = touchRef.current;
      const currentStage = stageRef.current;

      if (currentStage === 'loading' || currentStage === 'intro' || currentStage === 'summary' || currentStage === 'transition') return;

      if (!gamePausedRef.current) {
        const left = keys.has('arrowleft') || keys.has('a') || touch.left;
        const right = keys.has('arrowright') || keys.has('d') || touch.right;
        const jump = keys.has(' ') || keys.has('w') || keys.has('arrowup') || touch.jump;
        p.vx = right ? MOVE_SPEED : left ? -MOVE_SPEED : 0;
        if (p.vx !== 0) p.facing = p.vx > 0 ? 1 : -1;

        if (jump) {
          if (p.onGround) {
            p.vy = JUMP_FORCE; p.onGround = false; p.jumps = 1; audioManager.playJump();
          } else if (p.jumps === 1 && Math.abs(p.vy) < 2) {
            p.vy = JUMP_FORCE * 0.8; p.jumps = 2; audioManager.playJump();
            particlesRef.current.push(...spawnParticles(p.x + p.w / 2, p.y + p.h, 5, 'sparkle'));
          }
        }

        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 0;
        if (currentStage === 'stage2' && p.x > W - p.w) p.x = W - p.w;

        const groundY = H - 40 - p.h;
        if (p.y >= groundY) {
          p.y = groundY; p.vy = 0; p.onGround = true; p.jumps = 0;
        }
        p.onGround = p.y >= groundY;

        if (currentStage === 'stage2') {
          noPlatRef.current = platformsRef.current.find(pl => pl.type === 'no') || null;
        }

        if (currentStage === 'stage2' && noPlatRef.current) {
          const no = noPlatRef.current;
          const playerCenterX = p.x + p.w / 2;
          const playerCenterY = p.y + p.h / 2;
          const noCenterX = no.x + no.w / 2;
          const noCenterY = no.y + no.h / 2;
          const dx = noCenterX - playerCenterX;
          const dy = noCenterY - playerCenterY;
          const dist = Math.hypot(dx, dy);

          if (dist < 250) {
            audioManager.playNoRunAway();
            const leftX = 70;
            const rightX = W - no.w - 70;
            const leftDistance = Math.abs((leftX + no.w / 2) - playerCenterX);
            const rightDistance = Math.abs((rightX + no.w / 2) - playerCenterX);
            const targetX = leftDistance > rightDistance ? leftX : rightX;
            no.x = Math.max(20, Math.min(W - no.w - 20, targetX));
            no.y = H - 180;

            const movedDistance = Math.hypot(
              (no.x + no.w / 2) - playerCenterX,
              (no.y + no.h / 2) - playerCenterY
            );
            if (movedDistance < 250) {
              no.x = playerCenterX < W / 2 ? W - no.w - 70 : 70;
              no.y = H - 180;
            }
          }
        }

        for (const pl of platformsRef.current) {
          if (currentStage === 'stage2' && pl.type === 'no') continue;

          if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h >= pl.y && p.y + p.h <= pl.y + pl.h + 8 && p.vy >= 0) {
            p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.jumps = 0;

            if (currentStage === 'stage3' && pl.type === 'checkpoint' && pl.questionIndex !== undefined) {
              const qi = pl.questionIndex;
              if (qi === currentQRef.current && !answeredQsRef.current.has(qi) && activeQuestionRef.current === null) {
                audioManager.playCollect();
                particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 10));
                setActiveQuestion(qi);
              }
            }

            if (currentStage === 'stage2' && pl.type === 'yes') {
              audioManager.playSuccess();
              setCelebration(true);
              particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 30));
              setTimeout(() => { setCelebration(false); initStage('stage4'); }, 1500);
            }

            if (currentStage === 'stage4' && pl.type === 'letter' && !finalTransitionRef.current) {
              finalTransitionRef.current = true;
              audioManager.playRomanticFinale();
              particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 100));
              setCelebration(true);
              setTimeout(() => {
                setCelebration(false);
                setStage('transition');
              }, 1500);
            }
          }
        }
      }

      const targetCam = currentStage === 'stage2' ? 0 : p.x - W / 3;
      cameraXRef.current += (targetCam - cameraXRef.current) * 0.08;
      if (cameraXRef.current < 0) cameraXRef.current = 0;

      particlesRef.current = particlesRef.current.filter(pp => {
        pp.x += pp.vx; pp.y += pp.vy; pp.vy += 0.1; pp.life--; return pp.life > 0;
      });
      cloudsRef.current.forEach(c => {
        c.x += c.speed;
        if (c.x > cameraXRef.current + W + 100) c.x = cameraXRef.current - 100;
      });

      drawBackground(ctx, W, H);
      cloudsRef.current.forEach(c => drawCloud(ctx, { ...c, x: c.x - cameraXRef.current * 0.3 }));
      drawGround(ctx, cameraXRef.current, W, H);

      platformsRef.current.forEach(pl => {
        if (pl.type === 'letter') {
          drawLetter(ctx, pl.x - cameraXRef.current, pl.y, frameRef.current);
          return;
        }
        const renderPl = { ...pl, x: pl.x - cameraXRef.current };
        if (stageRef.current === 'stage3' && pl.questionIndex !== undefined) {
          ctx.globalAlpha = answeredQsRef.current.has(pl.questionIndex) ? 0.4 : pl.questionIndex > currentQRef.current ? 0.3 : 1;
        }
        drawPlatform(ctx, renderPl);
        ctx.globalAlpha = 1;

        if (stageRef.current === 'stage3' && pl.questionIndex !== undefined) {
          const qx = renderPl.x + renderPl.w / 2;
          const qy = renderPl.y + renderPl.h / 2;
          const bounce = pl.questionIndex === currentQRef.current && !answeredQsRef.current.has(pl.questionIndex) ? Math.sin(frameRef.current * 0.1) * 3 : 0;
          ctx.fillStyle = '#8B0000';
          ctx.font = 'bold 18px "Press Start 2P", cursive';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('?', qx, qy + bounce);
          ctx.textBaseline = 'alphabetic';
          if (pl.questionIndex === currentQRef.current && !answeredQsRef.current.has(pl.questionIndex)) {
            ctx.font = '7px "Press Start 2P", cursive';
            ctx.fillText('Jump here!', qx, renderPl.y - 8);
          }
          ctx.textAlign = 'left';
        }

        if (stageRef.current === 'stage2' && pl.type === 'yes') {
          ctx.fillStyle = '#fff'; ctx.font = '8px "Press Start 2P", cursive'; ctx.textAlign = 'center';
          ctx.fillText('Touch me!', renderPl.x + renderPl.w / 2, renderPl.y - 10); ctx.textAlign = 'left';
        }
        if (stageRef.current === 'stage2' && pl.type === 'no') {
          ctx.fillStyle = '#666'; ctx.font = '7px "Press Start 2P", cursive'; ctx.textAlign = 'center';
          ctx.fillText("Can't touch this!", renderPl.x + renderPl.w / 2, renderPl.y - 10); ctx.textAlign = 'left';
        }
      });

      drawPlayer(ctx, { ...p, x: p.x - cameraXRef.current }, frameRef.current);
      particlesRef.current.forEach(pp => drawParticle(ctx, { ...pp, x: pp.x - cameraXRef.current }));

      if (celebrationRef.current) {
        ctx.fillStyle = 'rgba(255,20,147,0.3)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff'; ctx.font = '16px "Press Start 2P", cursive'; ctx.textAlign = 'center';
        ctx.fillText('YES! ♥♥♥', W / 2, H / 2); ctx.textAlign = 'left';
        if (frameRef.current % 5 === 0) particlesRef.current.push(...spawnParticles(Math.random() * W, Math.random() * H, 3));
      }
      if (gamePausedRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = 'rgba(139,0,0,0.6)'; ctx.font = '7px "Press Start 2P", cursive';
      ctx.fillText('← → or A/D move  Double SPACE/W jump', 10, H - 10);
    };

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); audioManager.stopBgMusic(); };
  }, [initStage, stage === 'summary']);

  const handleMute = () => { audioManager.init(); setMuted(audioManager.toggleMute()); };

  const handleRestart = () => {
    setReplayMode(true);
    setAnswers([]); answersRef.current = []; setCurrentQ(0); currentQRef.current = 0;
    setActiveQuestion(null); activeQuestionRef.current = null; setCelebration(false); celebrationRef.current = false;
    frameRef.current = 0; finalTransitionRef.current = false; initStage('stage3');
  };

  if (stage === 'summary') return <SummaryScreen onRestart={handleRestart} />;

  if (stage === 'transition') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f7c4c9] px-5 py-8 select-none">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border-4 border-valentine-red bg-[#fffdf5] px-7 py-12 text-center shadow-[10px_12px_0_rgba(130,48,61,0.12)] md:px-14 md:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(175,102,102,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(175,102,102,0.11)_1px,transparent_1px)] [background-size:27px_27px]" />
          <div className="relative z-10">
            <p className="font-pixel text-[9px] uppercase tracking-[0.24em] text-valentine-red/70 md:text-[11px]">
              {replayMode ? 'you came back for another round' : 'quest complete'}
            </p>
            <h1 className="mt-5 font-hand text-4xl font-bold leading-tight text-[#a5233d] md:text-6xl">
              {replayMode ? 'Okay... one last thing.' : 'And now... one last thing.'}
            </h1>
            <p className="mx-auto mt-6 max-w-lg font-hand text-lg leading-relaxed text-[#7f3c49] md:text-xl">
              You made it all the way here.
              <br />
              There&apos;s one final page I wanted you to see.
            </p>
            <button
              onClick={() => setStage('summary')}
              className="mt-9 rounded-sm border-r-4 border-b-4 border-[#970f22] bg-[#ff6578] px-7 py-4 font-pixel text-xs text-white shadow-[0_5px_0_rgba(110,24,35,0.12)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 md:px-10 md:text-sm"
            >
              OPEN THE LAST PAGE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'intro' || stage === 'loading') {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f7c4c9] px-5 py-8 select-none">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(139,0,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,0,0,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-[#ff8da0]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#ff69b4]/20 blur-3xl" />

        <main className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
          <p className="font-pixel text-[8px] uppercase tracking-[0.28em] text-[#8b0000]/65 md:text-[10px]">
            a little something i made for you
          </p>

          <h1 className="mt-5 font-pixel text-2xl leading-relaxed text-[#8b0000] drop-shadow-sm md:text-4xl">
            A Little Date Quest
          </h1>

          <div className="mt-7 w-full max-w-2xl rounded-[26px] border-4 border-[#a5233d] bg-[#fffdf5]/95 px-6 py-7 shadow-[10px_12px_0_rgba(130,48,61,0.12)] backdrop-blur-sm md:px-12 md:py-9">
            <p className="font-hand text-xl leading-relaxed text-[#7f3c49] md:text-2xl">
              I could have just sent you a message, but I wanted to make something a little more memorable.
            </p>
            <p className="mx-auto mt-4 max-w-xl font-hand text-lg leading-relaxed text-[#8f5260] md:text-xl">
              This is a tiny game where you get to choose how our imaginary date starts, what we do, and what kind of evening sounds good to you.
            </p>
            <p className="mt-4 font-hand text-lg font-semibold text-[#a5233d] md:text-xl">
              There are no right or wrong answers. Just pick what feels like you.
            </p>

            <div className="mx-auto mt-7 grid max-w-xl gap-3 text-left md:grid-cols-3 md:gap-4">
              <div className="rounded-xl border-2 border-[#f0a2ad] bg-[#fff6f7] px-4 py-3">
                <p className="font-pixel text-[8px] text-[#a5233d]">01 · EXPLORE</p>
                <p className="mt-2 font-hand text-base text-[#7f3c49]">Move through the world and find the ? blocks.</p>
              </div>
              <div className="rounded-xl border-2 border-[#f0a2ad] bg-[#fff6f7] px-4 py-3">
                <p className="font-pixel text-[8px] text-[#a5233d]">02 · ANSWER</p>
                <p className="mt-2 font-hand text-base text-[#7f3c49]">Jump onto each ? and choose your answer.</p>
              </div>
              <div className="rounded-xl border-2 border-[#f0a2ad] bg-[#fff6f7] px-4 py-3">
                <p className="font-pixel text-[8px] text-[#a5233d]">03 · KEEP GOING</p>
                <p className="mt-2 font-hand text-base text-[#7f3c49]">Follow the next little challenge until the final page.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Start the date quest"
            onClick={handleStartGame}
            className="group mt-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#8b0000] bg-[#ff6578] shadow-[0_8px_0_#970f22,0_12px_25px_rgba(130,48,61,0.22)] transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:translate-y-1 active:shadow-[0_4px_0_#970f22,0_7px_15px_rgba(130,48,61,0.18)] md:h-28 md:w-28"
          >
            <span className="ml-2 h-0 w-0 border-y-[15px] border-l-[23px] border-y-transparent border-l-white transition-transform duration-200 group-hover:scale-110 md:border-y-[18px] md:border-l-[28px]" />
          </button>
          <p className="mt-4 font-pixel text-[9px] uppercase tracking-[0.22em] text-[#8b0000]/75 md:text-[10px]">
            press play to begin
          </p>

          <div className="mt-6 flex flex-col items-center gap-1 text-[#8b0000]/65">
            <p className="font-pixel text-[7px] uppercase tracking-wider md:text-[8px]">Controls</p>
            <p className="font-hand text-base md:text-lg">Desktop: ← → or A / D · Jump: Space / W / ↑</p>
            <p className="font-hand text-sm md:text-base">Mobile: use the on-screen controls</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block h-full w-full" style={{ imageRendering: 'pixelated' }} />

      <button onClick={handleMute} className="absolute top-4 left-4 z-20 bg-valentine-red/80 backdrop-blur-sm text-primary-foreground font-pixel text-xs px-4 py-3 rounded-full border-2 border-valentine-gold hover:scale-110 transition-all shadow-lg">
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="absolute top-4 right-4 z-20 bg-valentine-red/80 backdrop-blur-sm text-primary-foreground font-pixel text-xs px-4 py-3 rounded-full border-2 border-valentine-gold shadow-lg">
        {stage === 'stage3' && `Stage 1: Q${currentQ + 1}/6`}
        {stage === 'stage2' && 'Stage 2: Your Answer'}
        {stage === 'stage4' && 'Stage 3: Catch the Letter'}
      </div>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-4 w-full px-4">
        <h1 className="font-pixel text-valentine-red text-2xl md:text-3xl drop-shadow-lg animate-bounce">💕 Love Quest 💕</h1>

        {stage === 'stage2' && (
          <div className="bg-valentine-red/90 backdrop-blur-sm px-8 py-4 rounded-xl border-4 border-valentine-gold shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-2 -right-2 text-xl animate-pulse">✨</div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-pulse">✨</div>
            <p className="font-pixel text-white text-xs md:text-sm text-center leading-relaxed">
              Are you ready for this<br />
              <span className="text-valentine-gold text-lg md:text-xl">date?</span>
            </p>
          </div>
        )}

        {stage === 'stage3' && (
          <div className="bg-valentine-red/80 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-valentine-pink shadow-md">
            <p className="font-pixel text-white text-[9px] md:text-[10px]">Reach the ❓ blocks! ({answeredQsRef.current.size}/6)</p>
          </div>
        )}

        {stage === 'stage4' && (
          <div className="bg-white/90 px-4 py-2 rounded-full border-2 border-valentine-red shadow-md animate-pulse">
            <span className="text-valentine-red font-pixel text-[8px] md:text-[10px]">DON'T LET IT ESCAPE!</span>
          </div>
        )}
      </div>

      {activeQuestion !== null && <QuestionPopup questionIndex={activeQuestion} onAnswer={handleAnswer} />}

      <div
        className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 md:hidden"
        style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', touchAction: 'none' }}
      >
        <button
          type="button"
          aria-label="Move left"
          className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95 shadow-lg"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.left = true; }}
          onPointerUp={(e) => { e.preventDefault(); touchRef.current.left = false; }}
          onPointerCancel={() => { touchRef.current.left = false; }}
          onPointerLeave={() => { touchRef.current.left = false; }}
        >←</button>
        <button
          type="button"
          aria-label="Jump"
          className="bg-valentine-gold text-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95 shadow-lg"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.jump = true; }}
          onPointerUp={(e) => { e.preventDefault(); touchRef.current.jump = false; }}
          onPointerCancel={() => { touchRef.current.jump = false; }}
          onPointerLeave={() => { touchRef.current.jump = false; }}
        >▲</button>
        <button
          type="button"
          aria-label="Move right"
          className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95 shadow-lg"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.right = true; }}
          onPointerUp={(e) => { e.preventDefault(); touchRef.current.right = false; }}
          onPointerCancel={() => { touchRef.current.right = false; }}
          onPointerLeave={() => { touchRef.current.right = false; }}
        >→</button>
      </div>
    </div>
  );
}
