import { ANCHOR_NAMES } from "../data/program";
import { formatWeight } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";

export function HistoryPage() {
  const sessions = useAppStore((s) => s.sessions);
  const lastWeights = useAppStore((s) => s.lastWeights);

  const completed = [...sessions]
    .filter((s) => s.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 20);

  const anchors = Object.entries(lastWeights)
    .filter(([id]) =>
      ANCHOR_NAMES.some((n) =>
        id.toLowerCase().includes(
          n.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""),
        ),
      ),
    )
    .sort((a, b) => b[1] - a[1]);

  // Better: match by exercise name from last completed sessions
  const latestByName = new Map<string, number>();
  for (const s of completed) {
    for (const ex of s.exercises) {
      const w = [...ex.sets].reverse().find((x) => x.done && x.weight)?.weight;
      if (w == null) continue;
      // store by exerciseId; display later
      if (!latestByName.has(ex.exerciseId)) latestByName.set(ex.exerciseId, w);
    }
  }

  const displayAnchors = [...latestByName.entries()]
    .filter(([id]) =>
      /bench|squat|row|ohp|shoulder|curl|pressdown|rdl|deadlift/i.test(id),
    )
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
          Historia
        </h1>
        <p className="text-sm text-[var(--color-muted)]">Viimeisimmät painot ja treenit</p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Ankkuriliikkeet
        </h2>
        {displayAnchors.length === 0 && anchors.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Ei vielä lokia.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {(displayAnchors.length ? displayAnchors : Object.entries(lastWeights).slice(0, 10)).map(
              ([id, kg]) => (
                <li key={id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm capitalize">
                    {id.replace(/^p\d-/, "").replace(/-/g, " ")}
                  </span>
                  <span className="tabular-nums font-semibold text-[var(--color-accent)]">
                    {formatWeight(kg)} kg
                  </span>
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Viimeiset treenit
        </h2>
        {completed.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Ei valmiita sessioita.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {completed.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <p className="text-sm font-medium">
                  Viikko {s.programWeek} · päivä {s.workoutId}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {s.date} · {s.exercises.filter((e) => e.sets.some((x) => x.done)).length}/
                  {s.exercises.length} liikettä
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
