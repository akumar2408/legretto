export type PlayerColor = "red" | "blue" | "green" | "yellow";

export const PLAYER_COLORS: PlayerColor[] = ["red", "blue", "green", "yellow"];

export type CardLocation =
  | "ligretto"
  | "personalRow"
  | "hand"
  | "drawPile"
  | "center";

export interface Card {
  id: string;
  number: number;
  color: PlayerColor;
  ownerId: string;
  location: CardLocation;
}

export interface CenterPile {
  id: string;
  cards: Card[];
}

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  socketId: string;
  connected: boolean;
  isHost: boolean;
  ligrettoStack: Card[];
  personalRow: (Card | null)[];
  drawPile: Card[];
  hand: Card[];
  cardsPlayed: number;
  score: number;
}

export type GameStatus = "lobby" | "in_progress" | "ended";

export interface RoundResultEntry {
  playerId: string;
  name: string;
  cardsPlayed: number;
  ligrettoRemaining: number;
  roundScore: number;
  totalScore: number;
}

export interface RoundResult {
  finishedBy: string;
  leaderboard: RoundResultEntry[];
}

export interface RoomState {
  id: string;
  status: GameStatus;
  hostId: string;
  players: PlayerState[];
  centerPiles: CenterPile[];
  completedPiles: number;
  winnerId?: string;
  round: number;
  roundResult?: RoundResult;
}

export interface CreateRoomPayload {
  name: string;
  color: PlayerColor;
}

export interface JoinRoomPayload {
  roomId: string;
  name: string;
  color: PlayerColor;
}

export interface StartGamePayload {
  roomId: string;
}

export interface PlayCardPayload {
  roomId: string;
  cardId: string;
  source: "ligretto" | "personalRow" | "hand";
  pileId?: string;
  personalRowIndex?: number;
}

export interface DrawCardPayload {
  roomId: string;
}

export interface PlayAgainPayload {
  roomId: string;
}

export interface ServerToClientEvents {
  updateState: (state: RoomState) => void;
  endRound: (result: RoundResult) => void;
  invalidMove: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (
    payload: CreateRoomPayload,
    callback?: (roomId: string, playerId: string) => void
  ) => void;
  joinRoom: (
    payload: JoinRoomPayload,
    callback?: (success: boolean, message?: string, playerId?: string) => void
  ) => void;
  startGame: (payload: StartGamePayload) => void;
  playCard: (payload: PlayCardPayload) => void;
  drawCard: (payload: DrawCardPayload) => void;
  playAgain: (payload: PlayAgainPayload) => void;
}

export const LIGRETTO_STACK_SIZE = 10;
export const PERSONAL_ROW_SIZE = 3;
export const HAND_SIZE = 3;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
