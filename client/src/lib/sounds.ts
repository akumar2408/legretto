let ctx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
};

export const playTone = (type: "play" | "end"): void => {
  try {
    const context = getCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "triangle";
    osc.frequency.value = type === "end" ? 280 : 520;
    gain.gain.value = type === "end" ? 0.09 : 0.06;

    osc.connect(gain).connect(context.destination);

    const now = context.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.stop(now + 0.2);
  } catch (err) {
    console.error(err);
  }
};
