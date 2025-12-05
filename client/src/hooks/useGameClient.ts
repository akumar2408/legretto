import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  CreateRoomPayload,
  DrawCardPayload,
  JoinRoomPayload,
  PlayCardPayload,
  PlayAgainPayload,
  RoomState,
  RoundResult,
  ServerToClientEvents,
} from "@shared/types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export const useGameClient = () => {
  const [socket, setSocket] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [state, setState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pendingAction = useRef<string | null>(null);

  useEffect(() => {
    const instance: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      SERVER_URL,
      {
        autoConnect: true,
      }
    );

    instance.on("updateState", (nextState) => {
      setState(nextState);
      if (nextState.status !== "ended") {
        setRoundResult(null);
      }
    });

    instance.on("endRound", (result) => {
      setRoundResult(result);
    });

    instance.on("invalidMove", (msg) => {
      setMessage(msg);
      pendingAction.current = null;
    });

    setSocket(instance);
    return () => {
      instance.disconnect();
    };
  }, []);

  const me = useMemo(
    () => state?.players.find((p) => p.id === playerId) ?? null,
    [state, playerId]
  );

  const createRoom = (payload: CreateRoomPayload, onSuccess?: (roomId: string) => void) => {
    socket?.emit("createRoom", payload, (roomId, newPlayerId) => {
      setPlayerId(newPlayerId);
      onSuccess?.(roomId);
    });
  };

  const joinRoom = (
    payload: JoinRoomPayload,
    onResult?: (success: boolean, message?: string) => void
  ) => {
    socket?.emit("joinRoom", payload, (success, msg, newPlayerId) => {
      if (success && newPlayerId) {
        setPlayerId(newPlayerId);
      }
      onResult?.(Boolean(success), msg);
    });
  };

  const startGame = () => {
    if (!state) return;
    socket?.emit("startGame", { roomId: state.id });
  };

  const playCard = (payload: Omit<PlayCardPayload, "roomId">) => {
    if (!state || pendingAction.current === "play") return;
    pendingAction.current = "play";
    socket?.emit("playCard", { ...payload, roomId: state.id } as PlayCardPayload);
    setTimeout(() => {
      pendingAction.current = null;
    }, 150);
  };

  const drawCard = () => {
    if (!state || pendingAction.current === "draw") return;
    pendingAction.current = "draw";
    socket?.emit("drawCard", { roomId: state.id } as DrawCardPayload);
    setTimeout(() => {
      pendingAction.current = null;
    }, 150);
  };

  const playAgain = () => {
    if (!state) return;
    socket?.emit("playAgain", { roomId: state.id } as PlayAgainPayload);
  };

  return {
    socket,
    state,
    me,
    playerId,
    roundResult,
    message,
    setMessage,
    actions: {
      createRoom,
      joinRoom,
      startGame,
      playCard,
      drawCard,
      playAgain,
    },
  };
};
