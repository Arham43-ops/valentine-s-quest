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

          transformed = transformed.replace(
            `      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-4 md:hidden">
        <button className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onTouchStart={() => { touchRef.current.left = true; }} onTouchEnd={() => { touchRef.current.left = false; }} onMouseDown={() => { touchRef.current.left = true; }} onMouseUp={() => { touchRef.current.left = false; }}>←</button>
        <button className="bg-valentine-gold text-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onTouchStart={() => { touchRef.current.jump = true; }} onTouchEnd={() => { touchRef.current.jump = false; }} onMouseDown={() => { touchRef.current.jump = true; }} onMouseUp={() => { touchRef.current.jump = false; }}>▲</button>
        <button className="bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onTouchStart={() => { touchRef.current.right = true; }} onTouchEnd={() => { touchRef.current.right = false; }} onMouseDown={() => { touchRef.current.right = true; }} onMouseUp={() => { touchRef.current.right = false; }}>→</button>
      </div>`,
            `      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-3 md:hidden" style={{ touchAction: 'none' }}>
        <button aria-label="Move left" className="touch-none select-none bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onPointerDown={(e) => { e.preventDefault(); touchRef.current.left = true; }} onPointerUp={() => { touchRef.current.left = false; }} onPointerCancel={() => { touchRef.current.left = false; }} onPointerLeave={() => { touchRef.current.left = false; }}>←</button>
        <button aria-label="Jump" className="touch-none select-none bg-valentine-gold text-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onPointerDown={(e) => { e.preventDefault(); touchRef.current.jump = true; }} onPointerUp={() => { touchRef.current.jump = false; }} onPointerCancel={() => { touchRef.current.jump = false; }} onPointerLeave={() => { touchRef.current.jump = false; }}>▲</button>
        <button aria-label="Move right" className="touch-none select-none bg-valentine-pink text-primary-foreground font-pixel text-lg px-6 py-4 rounded-lg border-2 border-valentine-red active:scale-95" onPointerDown={(e) => { e.preventDefault(); touchRef.current.right = true; }} onPointerUp={() => { touchRef.current.right = false; }} onPointerCancel={() => { touchRef.current.right = false; }} onPointerLeave={() => { touchRef.current.right = false; }}>→</button>
      </div>`,
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
            `  const groundY = canvasH - (canvasW < 768 ? 120 : 40);`,
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
