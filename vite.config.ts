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
      name: "refine-mobile-game-hud",
      enforce: "pre",
      transform(code: string, id: string) {
        if (!id.endsWith("/src/components/game/Game.tsx")) return null;

        let transformed = code;

        transformed = transformed.replace(
          'className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 text-center md:top-5"',
          'className="pointer-events-none absolute left-1/2 top-[72px] z-20 w-full -translate-x-1/2 text-center md:top-5 md:w-auto"',
        );

        transformed = transformed.replace(
          'className="font-pixel text-2xl font-bold text-[#d81b48] drop-shadow-[2px_2px_0_#fff] md:text-4xl"',
          'className="font-pixel text-[27px] font-bold leading-none text-[#d81b48] drop-shadow-[2px_2px_0_#fff] md:text-4xl"',
        );

        transformed = transformed.replace(
          'className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-[#e62a51] px-6 py-3 font-pixel text-[10px] text-white shadow-[0_4px_0_#a81735] md:top-24 md:px-8 md:py-3 md:text-xs"',
          'className="pointer-events-none absolute left-1/2 top-[116px] z-20 w-[calc(100%-52px)] -translate-x-1/2 rounded-full bg-[#e62a51] px-4 py-3 font-pixel text-[9px] leading-tight text-white shadow-[0_4px_0_#a81735] md:top-24 md:w-auto md:px-8 md:py-3 md:text-xs"',
        );

        return transformed === code ? null : { code: transformed, map: null };
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
