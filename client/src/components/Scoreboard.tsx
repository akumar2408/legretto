import { motion } from "framer-motion";
import { RoundResult, RoomState } from "@shared/types";

interface ScoreboardProps {
  result: RoundResult;
  state: RoomState;
  isHost: boolean;
  onPlayAgain: () => void;
}

const Scoreboard = ({ result, state, isHost, onPlayAgain }: ScoreboardProps) => {
  const winner = state.players.find((p) => p.id === result.finishedBy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80">Round {state.round}</p>
            <h3 className="mt-1 text-2xl font-display text-white">
              {winner ? `${winner.name} called Ligretto!` : "Round finished"}
            </h3>
            <p className="text-sm text-slate-300/80">
              +1 per card played · -2 per card left in Ligretto stack
            </p>
          </div>
          {isHost && (
            <button
              onClick={onPlayAgain}
              className="rounded-xl bg-gradient-to-r from-ligrettoGreen to-ligrettoBlue px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-110"
            >
              Play again
            </button>
          )}
        </div>

        <div className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10 bg-slate-800/60">
          {result.leaderboard.map((entry, idx) => (
            <div
              key={entry.playerId}
              className="grid grid-cols-5 items-center gap-2 px-4 py-3 text-sm text-slate-100"
            >
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xs text-slate-300/70">#{idx + 1}</span>
                <span className="font-semibold">{entry.name}</span>
              </div>
              <div className="text-center text-amber-100">+{entry.cardsPlayed} cards</div>
              <div className="text-center text-rose-200">-{entry.ligrettoRemaining * 2} stack</div>
              <div className="text-right font-semibold text-white">
                {entry.roundScore >= 0 ? "+" : ""}
                {entry.roundScore} ({entry.totalScore})
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Scoreboard;
