# Love Quest 💕

A charming pixel-art platformer game built for Valentine's Day. Help the protagonist navigate through levels, propose to their Valentine, and answer fun questions to reach the romantic finale.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun

### Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd valentine-s-quest-main
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## 🎮 How to Play
- **Move**: `←` `→` or `A` / `D` keys
- **Jump**: `Space`, `W`, or `↑` keys
- **Goal**: Reach the checkpoint in each stage.
    - **Stage 1**: Navigate simple platforms to reach the "START".
    - **Stage 2**: Approach the "YES" platform to propose. (The "NO" platform might be hard to catch!)
    - **Stage 3**: Jump into the `?` blocks to answer romantic questions.

## 🛠️ Tech Stack
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State/Data**: [TanStack Query](https://tanstack.com/query/latest)
- **Audio**: Custom `AudioManager` using Web Audio API

## 📁 Project Structure
- `src/components/game`: Core game logic, renderer, and components.
    - `Game.tsx`: Main game loop and state management.
    - `renderer.ts`: Custom pixel-art canvas rendering logic.
    - `AudioManager.ts`: Sound effects and background music controller.
- `src/pages`: Application pages (Index and NotFound).

## 📜 Commands
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs ESLint for code quality.
- `npm run test`: Runs unit tests with Vitest.

---
Built with ❤️ for Valentine's Day.
