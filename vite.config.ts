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
    const groundOffset = mobileGame ? 120 : 40;
    p.x = s === 'stage2' ? Math.max(0, W / 2 - p.w / 2) : 60;
    p.y = s === 'stage2' ? H - groundOffset - p.h : mobileGame ? H - groundOffset - p.h : 300;`,
          );

          transformed = transformed.replace(
            `        const groundY = H - 40 - p.h;`,
            `        const groundY = H - (W < 768 ? 120 : 40) - p.h;`,
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

          // The game already has touch controls in the source. Do not rely on
          // Tailwind's md:hidden breakpoint for visibility; some mobile
          // browsers can report a larger layout viewport during game startup.
          transformed = transformed.replace(
            `className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 md:hidden"`,
            `className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-3"`,
          );
          transformed = transformed.replace(
            `style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', touchAction: 'none' }}`,
            `style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))', touchAction: 'none', display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex' : 'none' }}`,
          );

          // Keep the decorative ground well below the playable platforms on
          // phones so the game world does not collapse into one bottom strip.
          transformed = transformed.replace(
            `const groundOffset = mobileGame ? 120 : 40;`,
            `const groundOffset = mobileGame ? 132 : 40;`,
          );

          return transformed;
        }

        if (id.endsWith("/src/components/game/renderer.ts")) {
          let transformed = code.replace(
            `  const renderY = p.type === 'no' ? ctx.canvas.height - 180 : p.y;`,
            `  const mobileOffset = ctx.canvas.width < 768 ? 80 : 0;
  const renderY = p.type === 'no' ? ctx.canvas.height - 180 - mobileOffset : p.y;`,
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
