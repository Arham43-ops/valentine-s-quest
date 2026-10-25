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
        return code.replace(
          "  }, [initStage, stage === 'summary']);",
          "  }, [initStage, stage === 'stage2' || stage === 'stage3' || stage === 'stage4']);",
        );
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
