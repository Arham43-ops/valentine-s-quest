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

          transformed = transformed.replace(
            /const mobileGame = W < 768;\n\s*const groundOffset = mobileGame \? \d+ : 40;/,
            `const mobileGame = W < 768;\n    const groundOffset = mobileGame ? 150 : 40;`,
          );
          transformed = transformed.replace(
            /const groundY = H - \(W < 768 \? \d+ : 40\) - p\.h;/,
            `const groundY = H - (W < 768 ? 150 : 40) - p.h;`,
          );

          transformed = transformed.replace(
            /function getQuestionPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getAnswerPlatforms/,
            `function getQuestionPlatforms(H: number): Platform[] {\n  const platforms: Platform[] = [];\n  const spacing = 350;\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const questionY = mobileGame ? H - 290 : H - 160;\n  const connectorY = mobileGame ? H - 225 : H - 140;\n  for (let q = 0; q < QUESTIONS.length; q++) {\n    const baseX = 250 + q * spacing;\n    if (q > 0) {\n      platforms.push({ x: baseX - spacing / 2 - 40, y: connectorY, w: 80, h: 20, color: '#FF69B4' });\n    }\n    platforms.push({ x: baseX, y: questionY, w: 60, h: 40, color: '#FFD700', type: 'checkpoint', label: '?', questionIndex: q, active: q === 0 });\n  }\n  return platforms;\n}\n\nfunction getAnswerPlatforms`,
          );

          transformed = transformed.replace(
            /function getAnswerPlatforms\(H: number, W: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getLetterPlatforms/,
            `function getAnswerPlatforms(H: number, W: number): Platform[] {\n  const centerX = W / 2;\n  const noX = Math.max(30, centerX - 340);\n  const yesX = Math.min(W - 170, centerX + 170);\n  const mobileGame = W < 768;\n  const platformY = mobileGame ? H - 300 : H - 180;\n  const lowerY = mobileGame ? H - 215 : H - 120;\n  return [\n    { x: noX, y: platformY, w: 140, h: 30, color: '#888', type: 'no', label: 'NO' },\n    { x: yesX, y: platformY, w: 140, h: 30, color: '#FF1493', type: 'yes', label: 'YES ♥' },\n    { x: noX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },\n    { x: yesX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },\n  ];\n}\n\nfunction getLetterPlatforms`,
          );

          transformed = transformed.replace(
            /function getLetterPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nexport default function Game/,
            `function getLetterPlatforms(H: number): Platform[] {\n  const platforms: Platform[] = [];\n  const spacing = 320;\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const baseY = mobileGame ? H - 245 : H - 150;\n  for (let i = 0; i < 11; i++) {\n    platforms.push({ x: 200 + i * spacing, y: baseY - Math.sin(i * 0.5) * (mobileGame ? 90 : 120), w: 120, h: 20, color: '#FF69B4' });\n  }\n  platforms.push({ x: 650, y: mobileGame ? H - 255 : H - 160, w: 32, h: 24, type: 'letter' });\n  return platforms;\n}\n\nexport default function Game`,
          );

          transformed = transformed.replace(/no\.y = H - 180;/g, `no.y = W < 768 ? H - 300 : H - 180;`);

          transformed = transformed.replace(
            `<div className="absolute top-4 right-4 z-20 bg-valentine-red/80`,
            `<div className="absolute top-4 right-3 z-20 bg-valentine-red/80`,
          );
          transformed = transformed.replace(
            `<h1 className="font-pixel text-valentine-red text-2xl md:text-3xl`,
            `<h1 className="font-pixel text-valentine-red text-lg sm:text-2xl md:text-3xl`,
          );
          transformed = transformed.replace(
            `<div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none`,
            `<div className="absolute top-16 md:top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none`,
          );

          // Render the mobile controller in every playable stage. Use inline viewport
          // positioning because arbitrary Tailwind classes added by this transform are
          // not guaranteed to be present in the generated CSS. This keeps the controls
          // anchored to the actual phone viewport instead of their static DOM position.
          transformed = transformed.replace(
            `{stage === 'stage2' && (\n        <div className="pointer-events-none absolute bottom-16 left-1/2 z-40 flex -translate-x-1/2 items-end gap-4 md:bottom-8">`,
            `{stage !== 'intro' && stage !== 'loading' && stage !== 'summary' && stage !== 'transition' && (\n        <div\n          className="pointer-events-none flex items-end gap-3 md:hidden"\n          style={{ position: 'fixed', left: '50%', bottom: 'calc(12px + env(safe-area-inset-bottom))', transform: 'translateX(-50%)', zIndex: 100, touchAction: 'none' }}\n        >`,
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

          transformed = transformed.replace(
            `className="pointer-events-auto h-16 w-20 rounded-xl`,
            `className="pointer-events-auto touch-none select-none h-16 w-20 rounded-xl`,
          );

          return transformed;
        }

        if (id.endsWith("/src/components/game/renderer.ts")) {
          let transformed = code.replace(
            /const mobileOffset = ctx\.canvas\.width < 768 \? \d+ : 0;/,
            `const mobileOffset = ctx.canvas.width < 768 ? 120 : 0;`,
          );
          transformed = transformed.replace(
            /const groundY = canvasH - \(canvasW < 768 \? \d+ : 40\);/,
            `const groundY = canvasH - (canvasW < 768 ? 150 : 40);`,
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
