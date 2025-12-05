import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import {
  ClientToServerEvents,
  CreateRoomPayload,
  DrawCardPayload,
  JoinRoomPayload,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PlayAgainPayload,
  PlayCardPayload,
  RoomState,
  ServerToClientEvents,
  StartGamePayload,
} from "../../shared/types";
import {
  cycleHand,
  finishRound,
  resetForNextRound,
  startRound,
  tryPlayCard,
} from "./gameLogic";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
app.get("/", (_req, res) => {
  res.send("Ligretto real-time server is running.");
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

const PORT = process.env.PORT || 4000;
const rooms = new Map<string, RoomState>();

const createRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const emitState = (room: RoomState): void => {
  io.to(room.id).emit("updateState", room);
};

const sanitizeName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "Player";
  return trimmed.slice(0, 20);
};

const handleCreateRoom = (
  socketId: string,
  payload: CreateRoomPayload,
  callback?: (roomId: string, playerId: string) => void
): RoomState => {
  const roomId = createRoomCode();
  const playerId = uuid();

  const player = {
    id: playerId,
    name: sanitizeName(payload.name),
    color: payload.color,
    socketId,
    connected: true,
    isHost: true,
    ligrettoStack: [],
    personalRow: [],
    drawPile: [],
    hand: [],
    cardsPlayed: 0,
    score: 0,
  };

  const room: RoomState = {
    id: roomId,
    hostId: playerId,
    status: "lobby",
    players: [player],
    centerPiles: [],
    completedPiles: 0,
    round: 0,
  };

  rooms.set(roomId, room);
  callback?.(roomId, playerId);
  return room;
};

const handleJoinRoom = (
  socketId: string,
  payload: JoinRoomPayload,
  callback?: (success: boolean, message?: string, playerId?: string) => void
): boolean => {
  const roomId = payload.roomId.toUpperCase();
  const room = rooms.get(roomId);
  if (!room) {
    callback?.(false, "Room not found.");
    return false;
  }

  if (room.status !== "lobby") {
    callback?.(false, "Game already started.");
    return false;
  }

  if (room.players.length >= MAX_PLAYERS) {
    callback?.(false, "Room is full.");
    return false;
  }

  if (room.players.some((p) => p.color === payload.color)) {
    callback?.(false, "Color already taken.");
    return false;
  }

  const playerId = uuid();
  const player = {
    id: playerId,
    name: sanitizeName(payload.name),
    color: payload.color,
    socketId,
    connected: true,
    isHost: false,
    ligrettoStack: [],
    personalRow: [],
    drawPile: [],
    hand: [],
    cardsPlayed: 0,
    score: 0,
  };

  room.players.push(player);
  callback?.(true, undefined, playerId);
  return true;
};

const findRoomBySocket = (socketId: string): { room: RoomState; playerIndex: number } | null => {
  for (const room of rooms.values()) {
    const index = room.players.findIndex((p) => p.socketId === socketId);
    if (index !== -1) {
      return { room, playerIndex: index };
    }
  }
  return null;
};

const handleDisconnect = (socketId: string): void => {
  const found = findRoomBySocket(socketId);
  if (!found) return;
  const { room, playerIndex } = found;
  room.players[playerIndex].connected = false;
  room.players[playerIndex].socketId = "";
  room.players[playerIndex].isHost = false;

  if (room.hostId === room.players[playerIndex].id) {
    const nextHost = room.players.find((p) => p.connected);
    if (nextHost) {
      room.hostId = nextHost.id;
      nextHost.isHost = true;
    }
  }

  if (!room.players.some((p) => p.connected)) {
    rooms.delete(room.id);
    return;
  }

  emitState(room);
};

io.on("connection", (socket) => {
  socket.on("createRoom", (payload: CreateRoomPayload, callback) => {
    const room = handleCreateRoom(socket.id, payload, callback);
    socket.join(room.id);
    emitState(room);
  });

  socket.on("joinRoom", (payload: JoinRoomPayload, callback) => {
    const success = handleJoinRoom(socket.id, payload, callback);
    if (success) {
      const room = rooms.get(payload.roomId.toUpperCase());
      if (!room) return;
      socket.join(room.id);
      emitState(room);
    }
  });

  socket.on("startGame", (payload: StartGamePayload) => {
    const room = rooms.get(payload.roomId.toUpperCase());
    if (!room || room.status !== "lobby") return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || room.hostId !== player.id) return;
    if (room.players.length < MIN_PLAYERS) {
      socket.emit("invalidMove", "Need at least two players to start.");
      return;
    }
    startRound(room);
    emitState(room);
  });

  socket.on("playCard", (payload: PlayCardPayload) => {
    const room = rooms.get(payload.roomId.toUpperCase());
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    const result = tryPlayCard(room, player.id, payload);
    if (!result.success) {
      socket.emit("invalidMove", "That move is not allowed.");
      return;
    }

    if (result.finisherId) {
      const roundResult = finishRound(room, result.finisherId);
      emitState(room);
      io.to(room.id).emit("endRound", roundResult);
      return;
    }

    emitState(room);
  });

  socket.on("drawCard", (payload: DrawCardPayload) => {
    const room = rooms.get(payload.roomId.toUpperCase());
    if (!room || room.status !== "in_progress") return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || !player.connected) return;
    cycleHand(player);
    emitState(room);
  });

  socket.on("playAgain", (payload: PlayAgainPayload) => {
    const room = rooms.get(payload.roomId.toUpperCase());
    if (!room || room.status === "in_progress") return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player || room.hostId !== player.id) return;
    resetForNextRound(room);
    emitState(room);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Ligretto server listening on http://localhost:${PORT}`);
});
