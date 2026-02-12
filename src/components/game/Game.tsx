import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audioManager } from './AudioManager';
import { Player, Platform, Particle, Cloud, QUESTIONS, GameStage } from './types';
import {
  drawBackground, drawCloud, drawGround, drawPlatform,
  drawPlayer, drawParticle, drawPixelHeart, drawLetter
} from './renderer';
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

function getStage1Platforms(H: number): Platform[] {
  return [
    { x: 160, y: H - 120, w: 110, h: 20, color: '#FF69B4' },
    { x: 320, y: H - 155, w: 110, h: 20, color: '#DC143C' },
    { x: 480, y: H - 190, w: 110, h: 20, color: '#FF69B4' },
    { x: 600, y: H - 225, w: 120, h: 30, color: '#DC143C', type: 'checkpoint', label: '▼ START ▼' },
  ];
}

function getStage2Platforms(H: number): Platform[] {
  return [
    { x: 150, y: H - 180, w: 140, h: 30, color: '#FF1493', type: 'yes', label: 'YES ♥' },
    { x: 500, y: H - 180, w: 140, h: 30, color: '#888', type: 'no', label: "NO" },
    { x: 50, y: H - 120, w: 200, h: 20, color: '#FF69B4' },
    { x: 400, y: H - 120, w: 200, h: 20, color: '#FF69B4' },
  ];
}

// Stage 3: simple ground-level "?" blocks spaced apart with small platforms between
function getStage3Platforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 350;

  for (let q = 0; q < 6; q++) {
    const baseX = 250 + q * spacing;
    // Connecting platforms between question blocks
    if (q > 0) {
      platforms.push({
        x: baseX - spacing / 2 - 40, y: H - 140, w: 80, h: 20, color: '#FF69B4',
      });
    }
    // "?" block - floating block player hits from below or lands on
    platforms.push({
      x: baseX, y: H - 160, w: 60, h: 40,
      color: '#FFD700', type: 'checkpoint',
      label: '?', questionIndex: q,
      active: q === 0,
    });
  }
  return platforms;
}

// Stage 4: High floating platforms for the chase
function getStage4Platforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 320;
  for (let i = 0; i < 11; i++) {
    platforms.push({
      x: 200 + i * spacing,
      y: H - 150 - Math.sin(i * 0.5) * 120,
      w: 120, h: 20, color: '#FF69B4'
    });
  }
  // The Letter itself (as a platform type for collision)
  platforms.push({
    x: 650, y: H - 160, w: 32, h: 24, type: 'letter'
  });
  return platforms;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<GameStage>('loading');
  const [muted, setMuted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

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
  const touchRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({ left: false, right: false, jump: false });
  const answeredQsRef = useRef<Set<number>>(new Set());
  const gamePausedRef = useRef(false);

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { currentQRef.current = currentQ; }, [currentQ]);
  useEffect(() => { celebrationRef.current = celebration; }, [celebration]);
  useEffect(() => { activeQuestionRef.current = activeQuestion; gamePausedRef.current = activeQuestion !== null; }, [activeQuestion]);

  const initStage = useCallback((s: GameStage) => {
    const p = playerRef.current;
    p.x = 60; p.y = 300; p.vx = 0; p.vy = 0;
    cameraXRef.current = 0;
    particlesRef.current = [];
    answeredQsRef.current = new Set();
    gamePausedRef.current = false;
    setActiveQuestion(null);

    const canvasH = canvasRef.current?.height || window.innerHeight;
    const canvasW = canvasRef.current?.width || window.innerWidth;

    if (s === 'stage1') {
      platformsRef.current = getStage1Platforms(canvasH);
      cloudsRef.current = createClouds(8, 1200, canvasH);
    } else if (s === 'stage2') {
      platformsRef.current = getStage2Platforms(canvasH);
      noPlatRef.current = platformsRef.current.find(p => p.type === 'no') || null;
      cloudsRef.current = createClouds(6, 800, canvasH);
    } else if (s === 'stage3') {
      platformsRef.current = getStage3Platforms(canvasH);
      cloudsRef.current = createClouds(15, 2500, canvasH);
      setCurrentQ(0);
      setShowQuestion(false);
      setAnswers([]);
    } else if (s === 'stage4') {
      platformsRef.current = getStage4Platforms(canvasH);
      cloudsRef.current = createClouds(20, 4000, canvasH);
    }
    setStage(s);
  }, []);

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

    const nextQ = questionIndex + 1;
    if (questionIndex === QUESTIONS.length - 1) { // If this was the last question
      audioManager.playRomanticFinale();
      particlesRef.current.push(...spawnParticles(400, 200, 30));
      setTimeout(() => initStage('stage4'), 1200); // Transition to stage4
    } else {
      const nextQ = questionIndex + 1;
      setCurrentQ(nextQ);
      currentQRef.current = nextQ;
      // Activate next "?" block
      platformsRef.current.forEach(pp => {
        if (pp.questionIndex === nextQ) pp.active = true;
      });
    }
  }, []);

  // Input handlers
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  // Resize logic
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Re-init current stage on resize to reposition platforms
      if (stage !== 'loading' && stage !== 'summary') {
        const canvasH = canvas.height;
        if (stage === 'stage1') platformsRef.current = getStage1Platforms(canvasH);
        else if (stage === 'stage2') platformsRef.current = getStage2Platforms(canvasH);
        else if (stage === 'stage3') platformsRef.current = getStage3Platforms(canvasH);
        else if (stage === 'stage4') platformsRef.current = getStage4Platforms(canvasH);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [stage]); // Re-run when stage changes to capture new canvas mount

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    audioManager.init();
    audioManager.startBgMusic();
    initStage('stage1');

    const loop = () => {
      animId = requestAnimationFrame(loop);
      frameRef.current++;
      const W = canvas.width;
      const H = canvas.height;
      const p = playerRef.current;
      const keys = keysRef.current;
      const touch = touchRef.current;
      const currentStage = stageRef.current;

      if (currentStage === 'loading' || currentStage === 'summary') return;

      // Don't move player when question popup is open
      if (!gamePausedRef.current) {
        const moveLeft = keys.has('arrowleft') || keys.has('a') || touch.left;
        const moveRight = keys.has('arrowright') || keys.has('d') || touch.right;
        const jumpKey = keys.has(' ') || keys.has('w') || keys.has('arrowup') || touch.jump;

        p.vx = 0;
        if (moveLeft) { p.vx = -MOVE_SPEED; p.facing = -1; }
        if (moveRight) { p.vx = MOVE_SPEED; p.facing = 1; }

        if (jumpKey) {
          if (p.onGround) {
            p.vy = JUMP_FORCE;
            p.onGround = false;
            p.jumps = 1;
            audioManager.playJump();
          } else if (p.jumps === 1 && Math.abs(p.vy) < 2) { // Double jump at apex
            p.vy = JUMP_FORCE * 0.8;
            p.jumps = 2;
            audioManager.playJump();
            particlesRef.current.push(...spawnParticles(p.x + p.w / 2, p.y + p.h, 5, 'sparkle'));
          }
        }

        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;

        // Clamp player to not go left of world
        if (p.x < 0) p.x = 0;

        // Ground collision
        const groundY = H - 40 - p.h;
        if (p.y >= groundY) {
          p.y = groundY;
          p.vy = 0;
          p.onGround = true;
          p.jumps = 0;
        }

        // Platform collisions
        p.onGround = p.y >= groundY;
        const plats = platformsRef.current;
        for (const pl of plats) {
          if (
            p.x + p.w > pl.x && p.x < pl.x + pl.w &&
            p.y + p.h >= pl.y && p.y + p.h <= pl.y + pl.h + 8 &&
            p.vy >= 0
          ) {
            p.y = pl.y - p.h;
            p.vy = 0;
            p.onGround = true;
            p.jumps = 0;

            // Stage 1: checkpoint
            if (currentStage === 'stage1' && pl.type === 'checkpoint') {
              audioManager.playCollect();
              particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 15));
              setTimeout(() => initStage('stage2'), 500);
            }

            // Stage 2: YES
            if (currentStage === 'stage2' && pl.type === 'yes') {
              audioManager.playSuccess();
              setCelebration(true);
              particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 30));
              setTimeout(() => {
                setCelebration(false);
                initStage('stage3');
              }, 1500);
            }

            // Stage 3: "?" block - open question popup
            if (currentStage === 'stage3' && pl.type === 'checkpoint' && pl.questionIndex !== undefined) {
              const qi = pl.questionIndex;
              if (qi === currentQRef.current && !answeredQsRef.current.has(qi) && activeQuestionRef.current === null) {
                audioManager.playCollect();
                particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 10));
                setActiveQuestion(qi);
              }
            }

            // Stage 4: Letter collision
            if (currentStage === 'stage4' && pl.type === 'letter') {
              audioManager.playRomanticFinale();
              particlesRef.current.push(...spawnParticles(pl.x + pl.w / 2, pl.y, 100));
              setCelebration(true);
              setTimeout(() => {
                setStage('summary');
              }, 2000);
            }
          }
        }

        // NO button flee mechanic (Stage 2)
        if (currentStage === 'stage2' && noPlatRef.current) {
          const no = noPlatRef.current;
          const dist = Math.hypot((p.x + p.w / 2) - (no.x + no.w / 2), (p.y + p.h / 2) - (no.y + no.h / 2));
          if (dist < 100) {
            audioManager.playNoRunAway();
            no.x += 150 + Math.random() * 100; // Move forward
            no.y = 150 + Math.random() * 200;
          }
        }

        // Letter flee mechanic removed for ease of play
      }

      // Camera follow - keep player in the middle third of screen
      const targetCam = p.x - W / 3;
      cameraXRef.current += (targetCam - cameraXRef.current) * 0.08;
      if (cameraXRef.current < 0) cameraXRef.current = 0;

      // Keep player on screen horizontally (relative to world boundaries)
      if (p.x < 0) p.x = 0;
      // You can also add a world-width clamp here if desired for Stage 3

      // Update particles
      particlesRef.current = particlesRef.current.filter(pp => {
        pp.x += pp.vx;
        pp.y += pp.vy;
        pp.vy += 0.1;
        pp.life--;
        return pp.life > 0;
      });

      // Update clouds
      cloudsRef.current.forEach(c => {
        c.x += c.speed;
        if (c.x > cameraXRef.current + W + 100) c.x = cameraXRef.current - 100;
      });

      // === RENDER ===
      drawBackground(ctx, W, H);

      cloudsRef.current.forEach(c => {
        const cx = c.x - cameraXRef.current * 0.3;
        drawCloud(ctx, { ...c, x: cx });
      });

      drawGround(ctx, cameraXRef.current, W, H);

      // Platforms & Letter
      const plats = platformsRef.current;
      plats.forEach(pl => {
        if (pl.type === 'letter') {
          drawLetter(ctx, pl.x - cameraXRef.current, pl.y, frameRef.current);
          return;
        }
        const renderPl = { ...pl, x: pl.x - cameraXRef.current };

        // In stage 3, dim unanswered future "?" blocks
        if (stageRef.current === 'stage3' && pl.type === 'checkpoint' && pl.questionIndex !== undefined) {
          if (answeredQsRef.current.has(pl.questionIndex)) {
            ctx.globalAlpha = 0.4;
          } else if (pl.questionIndex > currentQRef.current) {
            ctx.globalAlpha = 0.3;
          }
        }

        drawPlatform(ctx, renderPl);
        ctx.globalAlpha = 1;

        // Draw "?" symbol on question blocks in stage 3
        if (stageRef.current === 'stage3' && pl.type === 'checkpoint' && pl.questionIndex !== undefined) {
          const qx = renderPl.x + renderPl.w / 2;
          const qy = renderPl.y + renderPl.h / 2;
          // Bouncing animation for active block
          const bounce = pl.questionIndex === currentQRef.current && !answeredQsRef.current.has(pl.questionIndex)
            ? Math.sin(frameRef.current * 0.1) * 3 : 0;
          ctx.fillStyle = '#8B0000';
          ctx.font = 'bold 18px "Press Start 2P", cursive';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', qx, qy + bounce);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
          // "Jump here!" hint for current question
          if (pl.questionIndex === currentQRef.current && !answeredQsRef.current.has(pl.questionIndex)) {
            ctx.fillStyle = '#8B0000';
            ctx.font = '7px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.fillText('Jump here!', qx, renderPl.y - 8);
            ctx.textAlign = 'left';
          }
        }

        // YES/NO labels in stage 2
        if (stageRef.current === 'stage2' && pl.type === 'yes') {
          ctx.fillStyle = '#fff';
          ctx.font = '8px "Press Start 2P", cursive';
          ctx.textAlign = 'center';
          ctx.fillText('Touch me!', renderPl.x + renderPl.w / 2, renderPl.y - 10);
          ctx.textAlign = 'left';
        }
        if (stageRef.current === 'stage2' && pl.type === 'no') {
          ctx.fillStyle = '#666';
          ctx.font = '7px "Press Start 2P", cursive';
          ctx.textAlign = 'center';
          ctx.fillText("Can't touch this!", renderPl.x + renderPl.w / 2, renderPl.y - 10);
          ctx.textAlign = 'left';
        }
      });

      // Player
      drawPlayer(ctx, { ...p, x: p.x - cameraXRef.current }, frameRef.current);

      // Particles
      particlesRef.current.forEach(pp => drawParticle(ctx, { ...pp, x: pp.x - cameraXRef.current }));

      // Celebration overlay
      if (celebrationRef.current) {
        ctx.fillStyle = 'rgba(255,20,147,0.3)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('YES! ♥♥♥', W / 2, H / 2);
        ctx.textAlign = 'left';
        if (frameRef.current % 5 === 0) {
          particlesRef.current.push(...spawnParticles(Math.random() * W, Math.random() * H, 3));
        }
      }

      // Celebration overlay
      if (celebrationRef.current) {
        ctx.fillStyle = 'rgba(255,20,147,0.3)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('YES! ♥♥♥', W / 2, H / 2);
        ctx.textAlign = 'left';
        if (frameRef.current % 5 === 0) {
          particlesRef.current.push(...spawnParticles(Math.random() * W, Math.random() * H, 3));
        }
      }

      // Dim game when question popup is open
      if (gamePausedRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, H);
      }

      // Controls
      ctx.fillStyle = 'rgba(139,0,0,0.6)';
      ctx.font = '7px "Press Start 2P", cursive';
      ctx.fillText('← → or A/D move  Double SPACE/W jump', 10, H - 10);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      audioManager.stopBgMusic();
    };
  }, [initStage, stage === 'summary']);

  const handleMute = () => {
    audioManager.init();
    const m = audioManager.toggleMute();
    setMuted(m);
  };

  const handleRestart = () => {
    setAnswers([]);
    answersRef.current = [];
    setCurrentQ(0);
    currentQRef.current = 0;
    setActiveQuestion(null);
    activeQuestionRef.current = null;
    setCelebration(false);
    celebrationRef.current = false;
    frameRef.current = 0;
    initStage('stage1');
  };

  if (stage === 'summary') {
    return <SummaryScreen onRestart={handleRestart} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative select-none w-full h-screen overflow-hidden">
      {/* Sound toggle */}
      <button
        onClick={handleMute}
        className="absolute top-4 left-4 z-20 bg-valentine-red/80 backdrop-blur-sm text-primary-foreground font-pixel text-xs px-4 py-3 rounded-full border-2 border-valentine-gold hover:scale-110 transition-all shadow-lg"
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Stage indicator */}
      <div className="absolute top-4 right-4 z-20 bg-valentine-red/80 backdrop-blur-sm text-primary-foreground font-pixel text-xs px-4 py-3 rounded-full border-2 border-valentine-gold shadow-lg">
        {stage === 'stage1' && 'Stage 1: Reach the Start'}
        {stage === 'stage2' && 'Stage 2: The Proposal'}
        {stage === 'stage3' && `Stage 3: Q${currentQ + 1}/6`}
        {stage === 'stage4' && 'Stage 4: Catch the Letter'}
      </div>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-4 w-full px-4">
        <h1 className="font-pixel text-valentine-red text-2xl md:text-3xl drop-shadow-lg animate-bounce">
          💕 Love Quest 💕
        </h1>

        {stage === 'stage1' && (
          <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-valentine-red shadow-lg transform -rotate-1">
            <p className="font-pixel text-valentine-red text-[10px] md:text-xs">
              Double Jump (W/Space) to reach! →
            </p>
          </div>
        )}

        {stage === 'stage2' && (
          <div className="bg-valentine-red/90 backdrop-blur-sm px-8 py-4 rounded-xl border-4 border-valentine-gold shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-2 -right-2 text-xl animate-pulse">💖</div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-pulse">💖</div>
            <p className="font-pixel text-white text-xs md:text-sm text-center leading-relaxed">
              Will you be my<br />
              <span className="text-valentine-gold text-lg md:text-xl">Valentine? ♥</span>
            </p>
          </div>
        )}

        {/* Dynamic Hints */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none">
          {stage === 'stage4' && (
            <div className="bg-white/90 px-4 py-2 rounded-full border-2 border-valentine-red shadow-md animate-pulse">
              <span className="text-valentine-red font-pixel text-[8px] md:text-[10px]">DON'T LET IT ESCAPE! 💌</span>
            </div>
          )}
        </div>

        {stage === 'stage3' && (
          <div className="bg-valentine-red/80 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-valentine-pink shadow-md">
            <p className="font-pixel text-white text-[9px] md:text-[10px]">
              Reach the ❓ blocks! ({answeredQsRef.current.size}/6)
            </p>
          </div>
        )}
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Question Popup Overlay */}
        {activeQuestion !== null && (
          <QuestionPopup
            questionIndex={activeQuestion}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="flex gap-4 mt-3 md:hidden">
        <button
          className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95"
          onTouchStart={() => { touchRef.current.left = true; }}
          onTouchEnd={() => { touchRef.current.left = false; }}
          onMouseDown={() => { touchRef.current.left = true; }}
          onMouseUp={() => { touchRef.current.left = false; }}
        >
          ←
        </button>
        <button
          className="bg-valentine-gold text-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95"
          onTouchStart={() => { touchRef.current.jump = true; }}
          onTouchEnd={() => { touchRef.current.jump = false; }}
          onMouseDown={() => { touchRef.current.jump = true; }}
          onMouseUp={() => { touchRef.current.jump = false; }}
        >
          ▲
        </button>
        <button
          className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95"
          onTouchStart={() => { touchRef.current.right = true; }}
          onTouchEnd={() => { touchRef.current.right = false; }}
          onMouseDown={() => { touchRef.current.right = true; }}
          onMouseUp={() => { touchRef.current.right = false; }}
        >
          →
        </button>
      </div>
    </div>
  );
}
