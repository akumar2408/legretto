import { AnimatePresence, motion } from "framer-motion";
import { CenterPile, PlayerState } from "@shared/types";
import { canPlayCard, getPlayerAccent } from "../utils/game";

interface PlayerAreaProps {
  player: PlayerState;
  isMe: boolean;
  centerPiles: CenterPile[];
  canInteract: boolean;
  onPlayCard: (payload: { cardId: string; source: "ligretto" | "personalRow" | "hand"; personalRowIndex?: number }) => void;
  onDraw: () => void;
}

const PlayerArea = ({
  player,
  isMe,
  centerPiles,
  canInteract,
  onPlayCard,
  onDraw,
}: PlayerAreaProps) => {
  const ligrettoTop = player.ligrettoStack[player.ligrettoStack.length - 1];

  const accent = getPlayerAccent(player.color);

  const renderCardFace = (label: string, value?: number, playable?: boolean) => (
    <div
      className={`card relative min-h-[88px] min-w-[96px] cursor-pointer bg-gradient-to-br ${accent} ${
        playable ? "playable" : ""
      }`}
    >
      <div className="absolute right-2 top-2 rounded-full bg-white/15 px-2 py-1 text-[10px] uppercase tracking-wide text-white/80">
        {label}
      </div>
      <div className="flex h-full items-center justify-center">
        <span className="text-4xl font-display">{value ?? "?"}</span>
      </div>
    </div>
  );

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${accent}`} />
          <div>
            <p className="text-sm font-semibold text-white">{player.name}</p>
            <p className="text-xs text-slate-300/70">
              {player.isHost ? "Host" : "Player"} · Score {player.score}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300/80">
          {!player.connected && <span className="rounded-full bg-rose-500/20 px-2 py-1 text-rose-100">Disconnected</span>}
          {isMe && <span className="rounded-full bg-amber-200/20 px-2 py-1 text-amber-50">You</span>}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Ligretto stack</p>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {ligrettoTop && (
                <motion.div
                  layout
                  key={ligrettoTop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => {
                    if (isMe && canInteract && canPlayCard(ligrettoTop, centerPiles)) {
                      onPlayCard({ cardId: ligrettoTop.id, source: "ligretto" });
                    }
                  }}
                  className={
                    isMe && canInteract && canPlayCard(ligrettoTop, centerPiles) ? "playable" : ""
                  }
                >
                  {renderCardFace(
                    "Top",
                    ligrettoTop.number,
                    isMe && canInteract && canPlayCard(ligrettoTop, centerPiles)
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-100">
              {player.ligrettoStack.length} left
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Personal row</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {player.personalRow.map((card, idx) =>
              card ? (
                <motion.div
                  key={card.id}
                  layout
                  onClick={() => {
                    if (isMe && canInteract && canPlayCard(card, centerPiles)) {
                      onPlayCard({ cardId: card.id, source: "personalRow", personalRowIndex: idx });
                    }
                  }}
                  className={
                    isMe && canInteract && canPlayCard(card, centerPiles) ? "playable" : ""
                  }
                >
                  {renderCardFace(
                    `#${idx + 1}`,
                    card.number,
                    isMe && canInteract && canPlayCard(card, centerPiles)
                  )}
                </motion.div>
              ) : (
                <div
                  key={`empty-${idx}`}
                  className="flex h-full min-h-[88px] min-w-[96px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-900/40 text-xs text-slate-300/70"
                >
                  Empty
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Hand & draw</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-end gap-2">
              {player.hand.map((card, idx) => {
                const isTop = idx === player.hand.length - 1;
                const playable = isMe && isTop && canInteract && canPlayCard(card, centerPiles);
                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${isTop ? "" : "-translate-y-2 opacity-70"} ${
                      playable ? "playable" : ""
                    }`}
                    onClick={() => {
                      if (playable) onPlayCard({ cardId: card.id, source: "hand" });
                    }}
                  >
                    {renderCardFace(isTop ? "Top" : "", card.number, playable)}
                  </motion.div>
                );
              })}
              {!player.hand.length && (
                <div className="h-[88px] w-[96px] rounded-xl border border-dashed border-white/15 bg-slate-900/40 text-center text-xs text-slate-300/60">
                  <div className="flex h-full items-center justify-center">Empty</div>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <button
                disabled={!isMe || !canInteract}
                onClick={onDraw}
                className="rounded-xl bg-gradient-to-r from-ligrettoBlue to-ligrettoGreen px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Draw / Next
              </button>
              <div className="flex justify-between text-xs text-slate-300/70">
                <span>{player.drawPile.length} in draw</span>
                <span>{player.cardsPlayed} played</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerArea;
