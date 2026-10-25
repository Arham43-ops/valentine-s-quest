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
      name: "fix-game-loop-after-intro",
      enforce: "pre",
      transform(code: string, id: string) {
        if (!id.endsWith("/src/components/game/Game.tsx")) return null;

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

        return transformed;
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
