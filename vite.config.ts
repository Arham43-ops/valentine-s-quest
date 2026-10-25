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

        // Game.tsx intentionally renders a separate intro screen before the
        // canvas exists. The animation effect must therefore start when the
        // first playable stage mounts, then stay alive through all game stages.
        let transformed = code.replace(
          "  }, [initStage, stage === 'summary']);",
          "  }, [initStage, stage === 'stage2' || stage === 'stage3' || stage === 'stage4']);",
        );

        // Keep the original gameplay source untouched while sending the six
        // selected answers to the site's private server endpoint at completion.
        transformed = transformed.replace(
          """    setAnswers(prev => {\n      const next = [...prev, fullAnswer];\n      answersRef.current = next;\n      return next;\n    });""",
          """    setAnswers(prev => {\n      const next = [...prev, fullAnswer];\n      answersRef.current = next;\n      if (questionIndex === QUESTIONS.length - 1) {\n        void fetch('/api/submit-answers', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ answers: next }),\n          keepalive: true,\n        }).catch(() => {});\n      }\n      return next;\n    });""",
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
