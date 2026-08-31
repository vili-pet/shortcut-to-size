import { useEffect, useState } from "react";

interface Props {
  seconds: number;
  active: boolean;
  onDone: () => void;
  onDismiss: () => void;
}

export function RestTimer({ seconds, active, onDone, onDismiss }: Props) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
  }, [active, seconds]);

  useEffect(() => {
    if (!active) return;
    if (left <= 0) {
      onDone();
      return;
    }
    const t = window.setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => window.clearTimeout(t);
  }, [active, left, onDone]);

  if (!active) return null;

  const m = Math.floor(left / 60);
  const s = left % 60;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 px-4">
      <div
        className={[
          "mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-4 py-3 shadow-lg",
          left <= 5 ? "animate-pulse-ring" : "",
        ].join(" ")}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Lepo</p>
          <p className="font-[family-name:var(--font-display)] text-4xl tabular-nums text-[var(--color-accent)]">
            {m}:{String(s).padStart(2, "0")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLeft((x) => x + 30)}
            className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm font-medium"
          >
            +30s
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)]"
          >
            Valmis
          </button>
        </div>
      </div>
    </div>
  );
}
