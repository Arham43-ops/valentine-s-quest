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
            `    setAnswers(prev => {
      const next = [...prev, fullAnswer];
      answersRef.current = next;
      return next;
    });`,
            `    setAnswers(prev => {
      const next = [...prev, fullAnswer];
      answersRef.current = next;
      if (questionIndex === QUESTIONS.length - 1) {
        void fetch('/api/submit-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: next }),
          keepalive: true,
        }).catch(() => {});
      }
      return next;
    });`,
          );

          // Keep the player and gameplay surface above the mobile controller area.
          transformed = transformed.replace(
            /const mobileGame = W < 768;\n\s*const groundOffset = mobileGame \? \d+ : 40;/,
            `const mobileGame = W < 768;\n    const groundOffset = mobileGame ? 150 : 40;`,
          );
          transformed = transformed.replace(
            /const groundY = H - \(W < 768 \? \d+ : 40\) - p\.h;/,
            `const groundY = H - (W < 768 ? 150 : 40) - p.h;`,
          );

          // Rebuild the platform generators for short phone viewports. Desktop is unchanged.
          transformed = transformed.replace(
            /function getQuestionPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getAnswerPlatforms/,
            `function getQuestionPlatforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 350;
  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;
  const questionY = mobileGame ? H - 290 : H - 160;
  const connectorY = mobileGame ? H - 225 : H - 140;
  for (let q = 0; q < QUESTIONS.length; q++) {
    const baseX = 250 + q * spacing;
    if (q > 0) {
      platforms.push({ x: baseX - spacing / 2 - 40, y: connectorY, w: 80, h: 20, color: '#FF69B4' });
    }
    platforms.push({
      x: baseX,
      y: questionY,
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

function getAnswerPlatforms`,
          );

          transformed = transformed.replace(
            /function getAnswerPlatforms\(H: number, W: number\): Platform\[\] \{[\s\S]*?\n\}\n\nfunction getLetterPlatforms/,
            `function getAnswerPlatforms(H: number, W: number): Platform[] {
  const centerX = W / 2;
  const noX = Math.max(30, centerX - 340);
  const yesX = Math.min(W - 170, centerX + 170);
  const mobileGame = W < 768;
  const platformY = mobileGame ? H - 300 : H - 180;
  const lowerY = mobileGame ? H - 215 : H - 120;

  return [
    { x: noX, y: platformY, w: 140, h: 30, color: '#888', type: 'no', label: 'NO' },
    { x: yesX, y: platformY, w: 140, h: 30, color: '#FF1493', type: 'yes', label: 'YES ♥' },
    { x: noX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },
    { x: yesX - 40, y: lowerY, w: 220, h: 20, color: '#FF69B4' },
  ];
}

function getLetterPlatforms`,
          );

          transformed = transformed.replace(
            /function getLetterPlatforms\(H: number\): Platform\[\] \{[\s\S]*?\n\}\n\nexport default function Game/,
            `function getLetterPlatforms(H: number): Platform[] {
  const platforms: Platform[] = [];
  const spacing = 320;
  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;
  const baseY = mobileGame ? H - 245 : H - 150;
  for (let i = 0; i < 11; i++) {
    platforms.push({ x: 200 + i * spacing, y: baseY - Math.sin(i * 0.5) * (mobileGame ? 90 : 120), w: 120, h: 20, color: '#FF69B4' });
  }
  platforms.push({ x: 650, y: mobileGame ? H - 255 : H - 160, w: 32, h: 24, type: 'letter' });
  return platforms;
}

export default function Game`,
          );

          // The NO platform must use the same lifted mobile height after it runs away.
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

          // Do not rely on Tailwind's md breakpoint for controls. Touch devices always get them.
          transformed = transformed.replace(
            `className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-3 md:hidden"`,
            `className="fixed bottom-3 left-1/2 z-[100] flex -translate-x-1/2 gap-3"`,
          );
          transformed = transformed.replace(
            /style=\{\{ bottom: 'calc\(16px \+ env\(safe-area-inset-bottom\)\)', touchAction: 'none'(?:, display: [^}]*)? \}\}/,
            `style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))', touchAction: 'none', display: (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || (typeof window !== 'undefined' && window.innerWidth < 768) ? 'flex' : 'none' }}`,
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
