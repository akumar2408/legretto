interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const TutorialModal = ({ open, onClose }: TutorialModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">How to play</p>
            <h2 className="text-2xl font-display text-white">Ligretto basics</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white transition hover:border-amber-200/60"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4 text-slate-200/80">
          <section>
            <h3 className="font-semibold text-white">Goal</h3>
            <p>Empty your Ligretto stack first. Everyone plays at the same time.</p>
          </section>

          <section>
            <h3 className="font-semibold text-white">Your cards</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <strong>Ligretto stack</strong> — 10 face-down cards, top is face-up. Biggest points swing.
              </li>
              <li>
                <strong>Personal row</strong> — 3 face-up helpers. When you play one, flip the next stack card into the gap.
              </li>
              <li>
                <strong>Hand & draw pile</strong> — click Draw/Next to rotate three cards; only the top is playable.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white">Center piles</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>Start a pile with a 1.</li>
              <li>Any color is fine; numbers must go up one by one.</li>
              <li>When a pile hits 10 it disappears and scores at the end.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white">Ending & scoring</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>Round ends immediately when someone empties their Ligretto stack.</li>
              <li>+1 per card you played to the center.</li>
              <li>-2 per card still in your Ligretto stack.</li>
              <li>Scores accumulate across rounds; hosts can start a new one.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
