import { useMemo } from "react";
import { PlayCardPayload, PlayerState, RoomState } from "@shared/types";
import CenterPiles from "./CenterPiles";
import PlayerArea from "./PlayerArea";
import { sortPlayersForDisplay } from "../utils/game";

interface GameBoardProps {
  state: RoomState;
  me: PlayerState | null;
  onPlayCard: (payload: Omit<PlayCardPayload, "roomId">) => void;
  onDraw: () => void;
}

const GameBoard = ({ state, me, onPlayCard, onDraw }: GameBoardProps) => {
  const orderedPlayers = useMemo(
    () => sortPlayersForDisplay(me, state.players),
    [me, state.players]
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-10 pt-4">
      <CenterPiles centerPiles={state.centerPiles} completedCount={state.completedPiles} />
      <div className="grid gap-4 lg:grid-cols-2">
        {orderedPlayers.map((player) => (
          <PlayerArea
            key={player.id}
            player={player}
            isMe={player.id === me?.id}
            centerPiles={state.centerPiles}
            canInteract={state.status === "in_progress"}
            onPlayCard={onPlayCard}
            onDraw={onDraw}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
