import { AnimatePresence, motion } from "framer-motion";
import { CenterPile } from "@shared/types";

interface CenterPilesProps {
  centerPiles: CenterPile[];
  completedCount: number;
}

const CenterPiles = ({ centerPiles, completedCount }: CenterPilesProps) => {
  return (
    <div className="card relative overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Center piles</p>
          <h3 className="text-lg font-semibold text-white">Stack from 1 to 10</h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-amber-200/80">
          Completed: {completedCount}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <AnimatePresence initial={false}>
          {centerPiles.map((pile) => {
            const top = pile.cards[pile.cards.length - 1];
            return (
              <motion.div
                key={pile.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex min-w-[120px] flex-col rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 shadow-card"
              >
                <div className="flex items-center justify-between text-xs text-slate-300/70">
                  <span>Pile</span>
                  <span>{pile.cards.length} cards</span>
                </div>
                <div className="mt-2 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 px-3 py-3 text-center shadow-inner">
                  <p className="text-xs text-slate-300/70">Top</p>
                  <p className="text-3xl font-display text-white">{top?.number ?? "-"}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!centerPiles.length && (
          <div className="rounded-xl border border-dashed border-amber-200/40 bg-amber-200/5 px-4 py-3 text-sm text-amber-100/80">
            Play any 1 to start the first pile.
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterPiles;
