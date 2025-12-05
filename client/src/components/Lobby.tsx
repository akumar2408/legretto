import { useEffect, useMemo, useState } from "react";
import {
  CreateRoomPayload,
  JoinRoomPayload,
  PLAYER_COLORS,
  MIN_PLAYERS,
  PlayerColor,
  PlayerState,
  RoomState,
} from "@shared/types";
import { getPlayerAccent } from "../utils/game";

interface LobbyProps {
  state: RoomState | null;
  me: PlayerState | null;
  onCreate: (payload: CreateRoomPayload, cb?: (roomId: string) => void) => void;
  onJoin: (
    payload: JoinRoomPayload,
    cb?: (success: boolean, message?: string) => void
  ) => void;
  onStart: () => void;
}

const COLOR_LABEL: Record<PlayerColor, string> = {
  red: "Flame Red",
  blue: "Electric Blue",
  green: "Neon Green",
  yellow: "Sunburst",
};

export const Lobby = ({ state, me, onCreate, onJoin, onStart }: LobbyProps) => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [color, setColor] = useState<PlayerColor>("red");
  const [feedback, setFeedback] = useState<string | null>(null);

  const usedColors = useMemo(
    () => new Set(state?.players?.map((p) => p.color) ?? []),
    [state]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("room");
    if (code) setRoomCode(code.toUpperCase());
  }, []);

  useEffect(() => {
    if (!usedColors.has(color)) return;
    const next = PLAYER_COLORS.find((c) => !usedColors.has(c));
    if (next) setColor(next);
  }, [usedColors, color]);

  const handleCreate = () => {
    setFeedback(null);
    onCreate({ name: name || "Player", color }, (id) => {
      setRoomCode(id);
      setFeedback(`Created room ${id}`);
    });
  };

  const handleJoin = () => {
    setFeedback(null);
    onJoin(
      { name: name || "Player", color, roomId: roomCode.trim().toUpperCase() },
      (success, message) => {
        if (success) {
          setFeedback("Joined! Waiting for host to start.");
        } else {
          setFeedback(message ?? "Unable to join.");
        }
      }
    );
  };

  const availableColors = PLAYER_COLORS.map((option) => ({
    value: option,
    disabled: usedColors.has(option) && state !== null,
  }));

  const isHost = Boolean(me?.isHost);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-card backdrop-blur-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80">
              Real-time chaos
            </p>
            <h1 className="mt-2 text-3xl font-display text-white sm:text-4xl">
              Ligretto Live
            </h1>
            <p className="mt-2 max-w-2xl text-slate-200/80">
              Create a table, invite friends, and race to empty your Ligretto stack.
              Everything is validated and synced through the server so you can focus on speed.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-ligrettoBlue/40 via-slate-900 to-ligrettoGreen/40 p-4 text-sm text-slate-100 shadow-card">
            <p className="font-semibold text-white">Quick tips</p>
            <ul className="mt-2 space-y-1 text-slate-200/80">
              <li>• Pick a color and share the room code.</li>
              <li>• Host starts the round when everyone is ready.</li>
              <li>• Play 1s to open piles, then stack upward to 10.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="card md:col-span-3 md:row-span-2 p-5">
          <h2 className="text-xl font-semibold text-white">Create or join</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300/80">
              Display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none ring-amber-300/60 focus:border-amber-300/50 focus:ring"
                placeholder="Speedster"
              />
            </label>
            <label className="text-sm text-slate-300/80">
              Room code (join)
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 uppercase text-white outline-none ring-amber-300/60 focus:border-amber-300/50 focus:ring"
                placeholder="ABCD"
                maxLength={6}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {availableColors.map((option) => (
              <button
                key={option.value}
                disabled={option.disabled}
                onClick={() => setColor(option.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-card transition ${
                  option.value === color
                    ? "border-white/70 bg-white/10"
                    : "border-white/10 bg-slate-800/80 hover:border-white/40"
                } ${option.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                aria-label={COLOR_LABEL[option.value]}
              >
                <span
                  className={`mr-2 inline-block h-3 w-3 rounded-full bg-gradient-to-br ${getPlayerAccent(option.value)}`}
                />
                {COLOR_LABEL[option.value]}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleCreate}
              className="rounded-xl bg-gradient-to-r from-ligrettoRed to-ligrettoYellow px-4 py-3 text-base font-semibold text-slate-900 shadow-card transition hover:brightness-105"
            >
              Create table
            </button>
            <button
              onClick={handleJoin}
              className="rounded-xl border border-white/20 bg-slate-800/80 px-4 py-3 text-base font-semibold text-white shadow-card transition hover:border-amber-200/50 hover:text-amber-100"
            >
              Join with code
            </button>
          </div>
          {feedback && <p className="mt-3 text-sm text-amber-200/90">{feedback}</p>}
        </div>

        <div className="card md:col-span-2 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Table lobby</h3>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-amber-200/90">
              {state ? `Room ${state.id}` : "Waiting"}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {state ? (
              state.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full bg-gradient-to-br ${getPlayerAccent(
                        player.color
                      )}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{player.name}</p>
                      <p className="text-xs text-slate-300/70">
                        {player.isHost ? "Host" : "Guest"} · {player.connected ? "Ready" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-amber-200/90">
                    {COLOR_LABEL[player.color]}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No players yet. Create or join a room.</p>
            )}
          </div>
          {state && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-sm text-slate-300/80">
                {state.players.length}/4 players · host starts when ready.
              </div>
              <button
                disabled={!isHost || state.players.length < MIN_PLAYERS}
                onClick={onStart}
                className="rounded-xl bg-gradient-to-r from-ligrettoGreen to-ligrettoBlue px-4 py-2 text-sm font-semibold text-white shadow-card transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
