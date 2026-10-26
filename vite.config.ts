import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
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

          transformed = transformed.replace(
            `    p.x = s === 'stage2' ? Math.max(0, W / 2 - p.w / 2) : 60;
    p.y = s === 'stage2' ? H - 40 - p.h : 300;`,
            `    const mobileGame = W < 768;
    const groundOffset = mobileGame ? 132 : 40;
    p.x = s === 'stage2' ? Math.max(0, W / 2 - p.w / 2) : 60;
    p.y = s === 'stage2' ? H - groundOffset - p.h : mobileGame ? H - groundOffset - p.h : 300;`,
          );

          transformed = transformed.replace(
            `        const groundY = H - 40 - p.h;`,
            `        const groundY = H - (W < 768 ? 132 : 40) - p.h;`,
          );

          // On phones reserve the bottom control area and lift playable
          // platforms into the main game area. Desktop positions stay intact.
          transformed = transformed.replace(
            `const spacing = 350;\n  for (let q = 0; q < QUESTIONS.length; q++) {`,
            `const spacing = 350;\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const questionPlatformY = mobileGame ? H - 290 : H - 160;\n  const connectorPlatformY = mobileGame ? H - 220 : H - 140;\n  for (let q = 0; q < QUESTIONS.length; q++) {`,
          );
          transformed = transformed.replace(
            `y: H - 140, w: 80, h: 20, color: '#FF69B4'`,
            `y: connectorPlatformY, w: 80, h: 20, color: '#FF69B4'`,
          );
          transformed = transformed.replace(
            `y: H - 160,\n      w: 60,`,
            `y: questionPlatformY,\n      w: 60,`,
          );

          transformed = transformed.replace(
            `  const platformY = H - 180;\n  const lowerY = H - 120;`,
            `  const mobileGame = W < 768;\n  const platformY = mobileGame ? H - 300 : H - 180;\n  const lowerY = mobileGame ? H - 205 : H - 120;`,
          );

          transformed = transformed.replace(
            `no.y = H - 180;`,
            `no.y = W < 768 ? H - 300 : H - 180;`,
          );

          transformed = transformed.replace(
            `no.y = H - 180;`,
            `no.y = W < 768 ? H - 300 : H - 180;`,
          );

          transformed = transformed.replace(
            `const spacing = 320;\n  for (let i = 0; i < 11; i++) {\n    platforms.push({ x: 200 + i * spacing, y: H - 150 - Math.sin(i * 0.5) * 120,`,
            `const spacing = 320;\n  const mobileGame = typeof window !== 'undefined' && window.innerWidth < 768;\n  const letterBaseY = mobileGame ? H - 245 : H - 150;\n  for (let i = 0; i < 11; i++) {\n    platforms.push({ x: 200 + i * spacing, y: letterBaseY - Math.sin(i * 0.5) * (mobileGame ? 90 : 120),`,
          );

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

          // Force the mobile controls to use the actual device width instead
          // of relying on Tailwind's breakpoint detection.
          transformed = transformed.replace(
            `className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 md:hidden"`,
            `className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-3"`,
          );
          transformed = transformed.replace(
            `style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', touchAction: 'none' }}`,
            `style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', touchAction: 'none', display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex' : 'none' }}`,
          );

          return transformed;
        }

        if (id.endsWith("/src/components/game/renderer.ts")) {
          let transformed = code.replace(
            `  const renderY = p.type === 'no' ? ctx.canvas.height - 180 : p.y;`,
            `  const mobileOffset = ctx.canvas.width < 768 ? 80 : 0;\n  const renderY = p.type === 'no' ? ctx.canvas.height - 180 - mobileOffset : p.y;`,
          );

          transformed = transformed.replace(
            `  const groundY = canvasH - 40;`,
            `  const groundY = canvasH - (canvasW < 768 ? 132 : 40);`,
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
