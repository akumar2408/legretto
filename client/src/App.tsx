import { useEffect, useMemo, useState } from "react";
import GameBoard from "./components/GameBoard";
import Lobby from "./components/Lobby";
import Scoreboard from "./components/Scoreboard";
import TutorialModal from "./components/TutorialModal";
import { useGameClient } from "./hooks/useGameClient";
import { playTone } from "./lib/sounds";

const App = () => {
  const { state, me, roundResult, message, setMessage, actions } = useGameClient();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message, setMessage]);

  useEffect(() => {
    if (roundResult) playTone("end");
  }, [roundResult]);

  const statusLabel = useMemo(() => {
    if (!state) return "Not connected";
    if (state.status === "lobby") return "Lobby";
    if (state.status === "in_progress") return "Live";
    return "Round finished";
  }, [state]);

  const handleShare = async () => {
    if (!state) return;
    const url = `${window.location.origin}?room=${state.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Room link copied!");
    } catch (err) {
      console.error(err);
      setMessage("Unable to copy link.");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
              Ligretto live
            </p>
            <h1 className="text-xl font-display text-white">Real-time tabletop</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200/80">
            {state && (
              <>
                <span className="rounded-full bg-white/5 px-3 py-1">
                  Room {state.id}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1">
                  Round {state.round}
                </span>
              </>
            )}
            <span className="rounded-full bg-ligrettoGreen/20 px-3 py-1 text-emerald-100">
              {statusLabel}
            </span>
            <button
              onClick={() => setShowHelp(true)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-amber-200/60"
            >
              How to play
            </button>
            <button
              onClick={handleShare}
              className="rounded-full border border-amber-200/50 bg-amber-200/20 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/30"
            >
              Share
            </button>
          </div>
        </div>
        {message && (
          <div className="mx-auto max-w-3xl px-4 pb-3">
            <div className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm text-amber-50">
              {message}
            </div>
          </div>
        )}
      </header>

      <main>
        {state && state.status !== "lobby" ? (
          <GameBoard
            state={state}
            me={me}
            onPlayCard={(payload) => {
              playTone("play");
              actions.playCard(payload);
            }}
            onDraw={() => {
              playTone("play");
              actions.drawCard();
            }}
          />
        ) : (
          <Lobby
            state={state}
            me={me}
            onCreate={actions.createRoom}
            onJoin={actions.joinRoom}
            onStart={actions.startGame}
          />
        )}
      </main>

      {roundResult && state && (
        <Scoreboard
          result={roundResult}
          state={state}
          isHost={Boolean(me?.isHost)}
          onPlayAgain={actions.playAgain}
        />
      )}

      <TutorialModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default App;
