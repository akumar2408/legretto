import { v4 as uuid } from "uuid";
import {
  Card,
  CenterPile,
  HAND_SIZE,
  LIGRETTO_STACK_SIZE,
  PERSONAL_ROW_SIZE,
  PlayCardPayload,
  PlayerColor,
  PlayerState,
  RoomState,
  RoundResult,
} from "../../shared/types";

const COPIES_PER_NUMBER = 4;

const shuffle = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const buildDeck = (playerId: string, color: PlayerColor): Card[] => {
  const cards: Card[] = [];
  for (let copy = 0; copy < COPIES_PER_NUMBER; copy += 1) {
    for (let number = 1; number <= 10; number += 1) {
      cards.push({
        id: uuid(),
        number,
        color,
        ownerId: playerId,
        location: "drawPile" as const,
      });
    }
  }
  return shuffle(cards);
};

export const cycleHand = (player: PlayerState): void => {
  if (player.hand.length) {
    const recycled = player.hand.map((card) => ({ ...card, location: "drawPile" as const }));
    player.hand = [];
    player.drawPile.unshift(...recycled);
  }

  const newHand: Card[] = [];
  for (let i = 0; i < HAND_SIZE; i += 1) {
    const card = player.drawPile.pop();
    if (!card) break;
    newHand.push({ ...card, location: "hand" as const });
  }

  player.hand = newHand;
};

const dealPlayer = (player: PlayerState): PlayerState => {
  const deck = buildDeck(player.id, player.color);

  const ligrettoStack = deck
    .splice(0, LIGRETTO_STACK_SIZE)
    .map((card) => ({ ...card, location: "ligretto" as const }));

  const personalRowCards = deck
    .splice(0, PERSONAL_ROW_SIZE)
    .map((card) => ({ ...card, location: "personalRow" as const }));

  const drawPile = deck.map((card) => ({ ...card, location: "drawPile" as const }));
  const personalRow: (Card | null)[] = Array(PERSONAL_ROW_SIZE).fill(null);
  personalRowCards.forEach((card, index) => {
    personalRow[index] = card;
  });

  const dealt: PlayerState = {
    ...player,
    ligrettoStack,
    personalRow,
    drawPile,
    hand: [],
    cardsPlayed: 0,
  };

  cycleHand(dealt);
  return dealt;
};

export const startRound = (room: RoomState): void => {
  room.centerPiles = [];
  room.completedPiles = 0;
  room.winnerId = undefined;
  room.round += 1;
  room.roundResult = undefined;
  room.status = "in_progress";

  room.players = room.players.map((player) =>
    dealPlayer({
      ...player,
      cardsPlayed: 0,
    })
  );
};

const getTargetPile = (
  centerPiles: CenterPile[],
  card: Card,
  pileId?: string
): { pile?: CenterPile; createNew?: boolean } | null => {
  if (card.number === 1) {
    return { createNew: true };
  }

  if (pileId) {
    const pile = centerPiles.find((p) => p.id === pileId);
    if (pile) {
      const top = pile.cards[pile.cards.length - 1];
      if (top && top.number === card.number - 1) {
        return { pile };
      }
    }
    return null;
  }

  const pile = centerPiles.find((p) => {
    const top = p.cards[p.cards.length - 1];
    return top && top.number === card.number - 1;
  });

  if (pile) return { pile };
  return null;
};

const removeCardFromSource = (
  player: PlayerState,
  payload: PlayCardPayload
): { card: Card; personalRowIndex?: number } | null => {
  if (payload.source === "ligretto") {
    const card = player.ligrettoStack[player.ligrettoStack.length - 1];
    if (!card || card.id !== payload.cardId) return null;
    player.ligrettoStack.pop();
    return { card };
  }

  if (payload.source === "hand") {
    const card = player.hand[player.hand.length - 1];
    if (!card || card.id !== payload.cardId) return null;
    player.hand.pop();
    return { card };
  }

  if (payload.source === "personalRow") {
    const index =
      payload.personalRowIndex ??
      player.personalRow.findIndex((rowCard) => rowCard?.id === payload.cardId);

    if (index === -1) return null;
    const card = player.personalRow[index];
    if (!card || card.id !== payload.cardId) return null;
    player.personalRow[index] = null;
    return { card, personalRowIndex: index };
  }

  return null;
};

const validateCardIsTop = (
  player: PlayerState,
  payload: PlayCardPayload
): boolean => {
  if (payload.source === "ligretto") {
    return player.ligrettoStack[player.ligrettoStack.length - 1]?.id === payload.cardId;
  }
  if (payload.source === "hand") {
    return player.hand[player.hand.length - 1]?.id === payload.cardId;
  }
  if (payload.source === "personalRow") {
    const index =
      payload.personalRowIndex ??
      player.personalRow.findIndex((card) => card?.id === payload.cardId);
    if (index === -1) return false;
    return player.personalRow[index]?.id === payload.cardId;
  }
  return false;
};

export const tryPlayCard = (
  room: RoomState,
  playerId: string,
  payload: PlayCardPayload
): { success: boolean; finisherId?: string } => {
  if (room.status !== "in_progress") return { success: false };

  const player = room.players.find((p) => p.id === playerId);
  if (!player || !player.connected) return { success: false };

  if (!validateCardIsTop(player, payload)) {
    return { success: false };
  }

  const card =
    payload.source === "ligretto"
      ? player.ligrettoStack[player.ligrettoStack.length - 1]
      : payload.source === "hand"
      ? player.hand[player.hand.length - 1]
      : player.personalRow[
          payload.personalRowIndex ??
            player.personalRow.findIndex((rowCard) => rowCard?.id === payload.cardId)
        ];

  if (!card) return { success: false };

  const target = getTargetPile(room.centerPiles, card, payload.pileId);
  if (!target) return { success: false };

  const removal = removeCardFromSource(player, payload);
  if (!removal) return { success: false };

  const playedCard = { ...removal.card, location: "center" as const };

  if (target.createNew) {
    room.centerPiles.push({ id: uuid(), cards: [playedCard] });
  } else if (target.pile) {
    target.pile.cards.push(playedCard);
  }

  if (removal.personalRowIndex !== undefined && player.ligrettoStack.length) {
    const replacement = player.ligrettoStack.pop() as Card;
    player.personalRow[removal.personalRowIndex] = {
      ...replacement,
      location: "personalRow",
    };
  }

  player.cardsPlayed += 1;

  const pileIndex = room.centerPiles.findIndex((pile) =>
    pile.cards.some((c) => c.id === playedCard.id)
  );
  if (pileIndex !== -1) {
    const pile = room.centerPiles[pileIndex];
    const top = pile.cards[pile.cards.length - 1];
    if (top && top.number === 10) {
      room.completedPiles += 1;
      room.centerPiles.splice(pileIndex, 1);
    }
  }

  if (player.ligrettoStack.length === 0) {
    return { success: true, finisherId: player.id };
  }

  return { success: true };
};

export const finishRound = (room: RoomState, finisherId: string): RoundResult => {
  room.status = "ended";
  room.winnerId = finisherId;

  const leaderboard = room.players
    .map((player) => {
      const ligrettoRemaining = player.ligrettoStack.length;
      const roundScore = player.cardsPlayed - ligrettoRemaining * 2;
      const updatedTotal = player.score + roundScore;
      player.score = updatedTotal;

      return {
        playerId: player.id,
        name: player.name,
        cardsPlayed: player.cardsPlayed,
        ligrettoRemaining,
        roundScore,
        totalScore: updatedTotal,
      };
    })
    .sort((a, b) => b.roundScore - a.roundScore);

  const result: RoundResult = {
    finishedBy: finisherId,
    leaderboard,
  };

  room.roundResult = result;
  return result;
};

export const resetForNextRound = (room: RoomState): void => {
  room.status = "lobby";
  room.centerPiles = [];
  room.completedPiles = 0;
  room.winnerId = undefined;
  room.roundResult = undefined;
  room.players.forEach((player) => {
    player.ligrettoStack = [];
    player.personalRow = Array(PERSONAL_ROW_SIZE).fill(null);
    player.drawPile = [];
    player.hand = [];
    player.cardsPlayed = 0;
    player.isHost = player.id === room.hostId;
  });
};
