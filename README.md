# Ligretto Live (multiplayer)

Real-time, multiplayer Ligretto built with TypeScript, Socket.IO, React, and Tailwind. Create a room, invite up to four people, and race to empty your Ligretto stack together in the browser.

## Quick start

1) **Install dependencies**
```bash
npm install --prefix server
npm install --prefix client
```

2) **Environment**
```bash
cp .env.example server/.env
cp .env.example client/.env
```
Adjust `PORT`, `CLIENT_ORIGIN`, and `VITE_SERVER_URL` if you run on different hosts/ports.

3) **Run the servers**
```bash
# Terminal 1
npm run dev --prefix server

# Terminal 2
npm run dev --prefix client
```
Backend listens on `http://localhost:4000` by default; frontend on `http://localhost:5173`.

## Game rules (simplified Ligretto)
- Each player gets 40 cards (1–10 in their color, 4 copies each).
- Deal 10 to the **Ligretto stack** (face-down, top is face-up), 3 to the **personal row**, rest to **draw pile** and **hand** (top 3).
- Everyone plays at once:
  - Start a center pile with a `1`.
  - Add to a pile only if your card is exactly +1 of its top number (colors don’t matter).
  - When a personal-row slot is emptied, flip the next Ligretto stack card into that slot.
  - Click **Draw / Next** to rotate your hand (only the top card is playable).
- When someone empties their Ligretto stack, the round ends immediately.
- Scoring: **+1** per card played to center piles, **-2** per card left in your Ligretto stack. Scores accumulate across rounds; the host can start another round.

## Scripts
**Server (`server/`)**
- `npm run dev` – ts-node-dev with live reload.
- `npm run build` – compile to `dist`.
- `npm start` – run compiled server.

**Client (`client/`)**
- `npm run dev` – Vite dev server.
- `npm run build` – type-check + build.
- `npm run preview` – preview production build.

## Tech & architecture
- **Backend:** Node.js, TypeScript, Express, Socket.IO. Server is source of truth: shuffling, dealing, validation, scoring, and room/lobby management (2–4 players, host-controlled start, disconnect-aware).
- **Frontend:** React + Vite + TypeScript + Tailwind. Mobile-first responsive layout with framer-motion animations and simple audio cues.
- **Shared:** Strongly typed card/game models in `shared/` consumed by both client and server.

## Project structure
```
shared/              # Shared types/constants
server/              # Express + Socket.IO backend
  src/index.ts       # Socket.IO setup & room handlers
  src/gameLogic.ts   # Pure game engine (dealing, moves, scoring)
client/              # React/Tailwind frontend
  src/components/    # UI (lobby, board, scoreboard, tutorial)
  src/hooks/         # Socket client & state
  src/utils/         # UI helpers
```

## Notes & polish
- Bright Ligretto-inspired palette, animated pile/card transitions, and a modal tutorial.
- Server validates every move, broadcasts state via `updateState`, and emits `endRound` summaries.
- Optional quick sound cues (play + end) via Web Audio API; muted by browser until first interaction on some devices.

Enjoy the chaos and call “Ligretto!” when your stack runs out.
