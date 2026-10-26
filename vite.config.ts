import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    {
      name: "fix-game-loop-and-mobile-layout",
      enforce: "pre",
      transform(code: string, id: string) {
        if (id.endsWith("/src/components/game/Game.tsx")) {
          let transformed = code.replace(
            "  }, [initStage, stage === 'summary']);",
            "  }, [initStage, stage === 'stage2' || stage === 'stage3' || stage === 'stage4']);",
          );

          transformed = transformed.replace(
            `    setAnswers(prev => {\n      const next = [...prev, fullAnswer];\n      answersRef.current = next;\n      return next;\n    });`,
            `    setAnswers(prev => {\n      const next = [...prev, fullAnswer];\n      answersRef.current = next;\n      if (questionIndex === QUESTIONS.length - 1) {\n        void fetch('/api/submit-answers', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ answers: next }),\n          keepalive: true,\n        }).catch(() => {});\n      }\n      return next;\n    });`,
          );

          // Keep the physics ground aligned with the renderer on mobile.
          transformed = transformed.replace(
            /const mobileGame = W < 768;\n\s*const groundOffset = mobileGame \? \d+ : 40;/,
            `const mobileGame = W < 768;\n    const groundOffset = 40;`,
          );
          transformed = transformed.replace(
            /const groundY = H - \(W < 768 \? \d+ : 40\) - p\.h;/,
            `const groundY = H - 40 - p.h;`,
          );

          // Mobile question platforms are close enough to reach with a normal
          // jump/double-jump, while still giving the level some vertical variety.
          transformed = transformed.replace(
            /function getQuestionPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getAnswerPlatforms/,
            `function getQuestionPlatforms(H: number): Platform[] {\n  const platforms: Platform[] = [];\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const spacing = mobileGame ? 260 : 350;\n  const startX = mobileGame ? 130 : 250;\n  const questionY = mobileGame ? H - 190 : H - 160;\n  const connectorY = mobileGame ? H - 125 : H - 140;\n\n  for (let q = 0; q < QUESTIONS.length; q++) {\n    const baseX = startX + q * spacing;\n    if (q > 0) {\n      platforms.push({ x: baseX - spacing / 2 - 40, y: connectorY, w: 80, h: 20, color: '#FF69B4' });\n    }\n    platforms.push({\n      x: baseX,\n      y: questionY - (mobileGame ? (q % 3) * 18 : 0),\n      w: 60,\n      h: 40,\n      color: '#FFD700',\n      type: 'checkpoint',\n      label: '?',\n      questionIndex: q,\n      active: q === 0,\n    });\n  }\n  return platforms;\n}\n\nfunction getAnswerPlatforms`,
          );

          // Keep the YES/NO challenge comfortably reachable on short screens.
          transformed = transformed.replace(
            /function getAnswerPlatforms\(H: number, W: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getLetterPlatforms/,
            `function getAnswerPlatforms(H: number, W: number): Platform[] {\n  const centerX = W / 2;\n  const mobileGame = W < 768;\n  const platformY = mobileGame ? H - 190 : H - 180;\n  const lowerY = mobileGame ? H - 110 : H - 120;\n  const noX = mobileGame ? 24 : Math.max(30, centerX - 340);\n  const yesX = mobileGame ? Math.max(164, W - 164) : Math.min(W - 170, centerX + 170);\n\n  return [\n    { x: noX, y: platformY, w: mobileGame ? 120 : 140, h: 30, color: '#888', type: 'no', label: 'NO' },\n    { x: yesX, y: platformY, w: mobileGame ? 120 : 140, h: 30, color: '#FF1493', type: 'yes', label: 'YES ♥' },\n    { x: noX - (mobileGame ? 2 : 40), y: lowerY, w: mobileGame ? 124 : 220, h: 20, color: '#FF69B4' },\n    { x: yesX - (mobileGame ? 2 : 40), y: lowerY, w: mobileGame ? 124 : 220, h: 20, color: '#FF69B4' },\n  ];\n}\n\nfunction getLetterPlatforms`,
          );

          transformed = transformed.replace(
            /function getLetterPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nexport default function Game/,
            `function getLetterPlatforms(H: number): Platform[] {\n  const platforms: Platform[] = [];\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const spacing = mobileGame ? 250 : 320;\n  const startX = mobileGame ? 110 : 200;\n  const baseY = mobileGame ? H - 170 : H - 150;\n  for (let i = 0; i < 11; i++) {\n    platforms.push({ x: startX + i * spacing, y: baseY - Math.sin(i * 0.5) * (mobileGame ? 60 : 120), w: 120, h: 20, color: '#FF69B4' });\n  }\n  platforms.push({ x: mobileGame ? 520 : 650, y: mobileGame ? H - 185 : H - 160, w: 32, h: 24, type: 'letter' });\n  return platforms;\n}\n\nexport default function Game`,
          );

          // Start the player on the visible ground on phones instead of making the
          // first frame begin hundreds of pixels above the playable area.
          transformed = transformed.replace(
            `p.y = s === 'stage2' ? H - 40 - p.h : 300;`,
            `p.y = s === 'stage2' ? H - 40 - p.h : (W < 768 ? H - 40 - p.h : 300);`,
          );

          // Give mobile a little more jump height without changing desktop physics.
          transformed = transformed.replace(
            `p.vy = JUMP_FORCE; p.onGround = false; p.jumps = 1; audioManager.playJump();`,
            `p.vy = W < 768 ? -10.5 : JUMP_FORCE; p.onGround = false; p.jumps = 1; audioManager.playJump();`,
          );
          transformed = transformed.replace(
            `p.vy = JUMP_FORCE * 0.8; p.jumps = 2; audioManager.playJump();`,
            `p.vy = (W < 768 ? -10.5 : JUMP_FORCE) * 0.8; p.jumps = 2; audioManager.playJump();`,
          );

          transformed = transformed.replace(/no\.y = W <= 768 \? Math\.max\(170, H - 260\) : H - 180;/g, `no.y = W < 768 ? H - 190 : H - 180;`);
          transformed = transformed.replace(/no\.y = W <= 768 \? Math\.max\(170, H - 260\) : H - 180;/g, `no.y = W < 768 ? H - 190 : H - 180;`);
          transformed = transformed.replace(/no\.y = H - 180;/g, `no.y = W < 768 ? H - 190 : H - 180;`);

          // Mobile HUD: reserve the top rows instead of stacking the title,
          // stage badge and objective on top of each other.
          transformed = transformed.replace(
            `className="relative min-h-screen w-full overflow-hidden bg-[#f7c4c9] select-none"`,
            `className="relative h-[100dvh] min-h-screen w-full overflow-hidden bg-[#f7c4c9] select-none"`,
          );
          transformed = transformed.replace(
            `className="absolute left-1/2 top-4 z-20 -translate-x-1/2 text-center md:top-5"`,
            `className="pointer-events-none absolute left-1/2 top-[78px] z-20 -translate-x-1/2 text-center md:top-5"`,
          );
          transformed = transformed.replace(
            `className="font-pixel text-2xl font-bold text-[#d81b48] drop-shadow-[2px_2px_0_#fff] md:text-4xl"`,
            `className="font-pixel text-xl font-bold text-[#d81b48] drop-shadow-[2px_2px_0_#fff] md:text-4xl"`,
          );
          transformed = transformed.replace(
            `className="absolute left-4 top-4 z-30 flex items-center gap-2 md:left-6 md:top-6"`,
            `className="absolute left-3 top-3 z-30 flex items-center gap-2 md:left-6 md:top-6"`,
          );
          transformed = transformed.replace(
            `className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#ffd21f] bg-[#e62a51] text-lg shadow-[0_4px_0_#a81735] active:translate-y-1 md:h-14 md:w-14"`,
            `className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#ffd21f] bg-[#e62a51] text-base shadow-[0_4px_0_#a81735] active:translate-y-1 md:h-14 md:w-14 md:text-lg"`,
          );
          transformed = transformed.replace(
            `className="absolute right-4 top-4 z-30 rounded-full border-2 border-[#ffd21f] bg-[#e62a51] px-5 py-3 font-pixel text-xs text-white shadow-[0_4px_0_#a81735] md:right-6 md:top-6 md:px-7 md:py-4 md:text-sm"`,
            `className="absolute right-3 top-3 z-30 rounded-full border-2 border-[#ffd21f] bg-[#e62a51] px-3 py-2 font-pixel text-[9px] text-white shadow-[0_4px_0_#a81735] md:right-6 md:top-6 md:px-7 md:py-4 md:text-sm"`,
          );
          transformed = transformed.replace(
            `className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-[#e62a51] px-6 py-3 font-pixel text-[10px] text-white shadow-[0_4px_0_#a81735] md:top-24 md:px-8 md:py-3 md:text-xs"`,
            `className="pointer-events-none absolute left-1/2 top-[124px] z-20 w-[calc(100%-48px)] -translate-x-1/2 rounded-2xl bg-[#e62a51] px-4 py-3 text-center font-pixel text-[9px] leading-relaxed text-white shadow-[0_5px_0_#a81735] md:top-24 md:w-auto md:rounded-full md:px-8 md:py-3 md:text-xs"`,
          );
          transformed = transformed.replace(
            `className="pointer-events-none absolute left-1/2 top-32 z-20 w-[min(90vw,680px)] -translate-x-1/2 rounded-2xl border-4 border-[#ffd21f] bg-[#e62a51] px-6 py-4 text-center font-pixel text-sm leading-relaxed text-white shadow-[0_7px_0_rgba(160,25,55,0.25)] md:top-36 md:px-10 md:py-5 md:text-lg"`,
            `className="pointer-events-none absolute left-1/2 top-[124px] z-20 w-[calc(100%-28px)] -translate-x-1/2 rounded-2xl border-2 border-[#ffd21f] bg-[#e62a51] px-4 py-3 text-center font-pixel text-[10px] leading-relaxed text-white shadow-[0_6px_0_rgba(160,25,55,0.25)] md:top-36 md:w-[min(90vw,680px)] md:border-4 md:px-10 md:py-5 md:text-lg"`,
          );

          // Render the mobile controller in every playable stage and anchor it to
          // the viewport with inline styles, not dynamically injected Tailwind classes.
          transformed = transformed.replace(
            `{stage === 'stage2' && (\n        <div className="pointer-events-none absolute bottom-16 left-1/2 z-40 flex -translate-x-1/2 items-end gap-4 md:bottom-8">`,
            `{stage !== 'intro' && stage !== 'loading' && stage !== 'summary' && stage !== 'transition' && (\n        <div\n          className="pointer-events-none flex items-end gap-2 md:hidden"\n          style={{ position: 'fixed', left: '50%', bottom: 'calc(10px + env(safe-area-inset-bottom))', transform: 'translateX(-50%)', zIndex: 100, touchAction: 'none' }}\n        >`,
          );

          transformed = transformed.replace(
            `className="pointer-events-auto h-16 w-20 rounded-xl`,
            `className="pointer-events-auto touch-none select-none h-14 w-[72px] rounded-xl`,
          );
          transformed = transformed.replace(
            `className="pointer-events-auto h-16 w-20 rounded-xl`,
            `className="pointer-events-auto touch-none select-none h-14 w-[72px] rounded-xl`,
          );
          transformed = transformed.replace(
            `className="pointer-events-auto h-16 w-20 rounded-xl`,
            `className="pointer-events-auto touch-none select-none h-14 w-[72px] rounded-xl`,
          );

          transformed = transformed.replace(
            `onPointerDown={() => { touchRef.current.left = true; }}`,
            `onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.left = true; }}`,
          );
          transformed = transformed.replace(
            `onPointerDown={() => { touchRef.current.jump = true; }}`,
            `onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.jump = true; }}`,
          );
          transformed = transformed.replace(
            `onPointerDown={() => { touchRef.current.right = true; }}`,
            `onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touchRef.current.right = true; }}`,
          );

          return transformed;
        }

        if (id.endsWith("/src/components/game/renderer.ts")) {
          let transformed = code.replace(
            /export function drawPlayer\(ctx: CanvasRenderingContext2D, p: Player, frame: number\) \{[\s\S]*?\n\}\n\nexport function drawPlatform/,
            `export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, frame: number) {\n  const { x, y, w, h, facing } = p;\n  const scale = ctx.canvas.width < 768 ? 1.3 : 1;\n  const dw = w * scale;\n  const dh = h * scale;\n  const dx = x - (dw - w) / 2;\n  const dy = y - (dh - h);\n\n  // Strong outline + contrasting body keeps the player visible against the pink world.\n  ctx.fillStyle = 'rgba(80,20,35,0.22)';\n  ctx.fillRect(dx + 3, dy + dh - 2, dw - 6, 4);\n  ctx.fillStyle = '#8B0000';\n  ctx.fillRect(dx + 2, dy + 7, dw - 4, dh - 10);\n  ctx.fillStyle = '#FF3F8E';\n  ctx.fillRect(dx + 5, dy + 9, dw - 10, dh - 14);\n  ctx.fillStyle = '#FFF4F6';\n  ctx.fillRect(dx + 6, dy + 1, dw - 12, 13);\n  ctx.fillStyle = '#8B0000';\n  const eyeOff = facing > 0 ? 4 : -4;\n  ctx.fillRect(dx + dw / 2 - 4 + eyeOff, dy + 5, 3, 3);\n  ctx.fillRect(dx + dw / 2 + 2 + eyeOff, dy + 5, 3, 3);\n  ctx.fillStyle = '#DC143C';\n  const legOff = Math.abs(Math.sin(frame * 0.2)) * 3;\n  ctx.fillRect(dx + 6, dy + dh - 8, 6, 8 + (p.vx !== 0 ? legOff : 0));\n  ctx.fillRect(dx + dw - 12, dy + dh - 8, 6, 8 + (p.vx !== 0 ? -legOff + 3 : 0));\n  drawPixelHeart(ctx, dx + dw / 2, dy + 15, 9, '#FF1493');\n}\n\nexport function drawPlatform`,
          );
          return transformed;
        }

        return null;
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
