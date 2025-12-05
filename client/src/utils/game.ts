import { Card, CenterPile, PlayerColor, PlayerState } from "@shared/types";

export const canPlayCard = (card: Card, centerPiles: CenterPile[]): boolean => {
  if (card.number === 1) return true;
  return centerPiles.some((pile) => {
    const top = pile.cards[pile.cards.length - 1];
    return top && top.number === card.number - 1;
  });
};

export const getPlayerAccent = (color: PlayerColor): string => {
  switch (color) {
    case "red":
      return "from-ligrettoRed/90 to-rose-500/80 border-rose-300/60";
    case "blue":
      return "from-ligrettoBlue/90 to-sky-500/80 border-sky-300/60";
    case "green":
      return "from-ligrettoGreen/90 to-emerald-500/80 border-emerald-300/60";
    case "yellow":
      return "from-ligrettoYellow/90 to-amber-400/80 border-amber-200/60 text-slate-900";
    default:
      return "from-slate-700 to-slate-500";
  }
};

export const sortPlayersForDisplay = (
  me: PlayerState | null,
  players: PlayerState[]
): PlayerState[] => {
  if (!me) return players;
  return [me, ...players.filter((p) => p.id !== me.id)];
};
