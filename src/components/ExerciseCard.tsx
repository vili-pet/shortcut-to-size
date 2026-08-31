import { useState } from "react";
import type { ExerciseTemplate, Intensity } from "../data/program";
import { getRepRange } from "../data/program";
import type { ExerciseLog, LoggedSet } from "../store/useAppStore";
import { formatWeight } from "../lib/hooks";
import { MOVEMENT_LABEL_FI, movementKindFor } from "../lib/movement";
import { MovementDemo } from "./MovementDemo";

interface Props {
  exercise: ExerciseTemplate;
  microWeek: 1 | 2 | 3 | 4;
  intensity: Intensity;
  log: ExerciseLog | undefined;
  prevSets?: LoggedSet[];
  onChange: (setIndex: number, patch: Partial<LoggedSet>) => void;
  onSetDone: (setIndex: number, restSec: number) => void;
  onAddBonus: () => void;
}

export function ExerciseCard({
  exercise,
  microWeek,
  intensity,
  log,
  prevSets,
  onChange,
  onSetDone,
  onAddBonus,
}: Props) {
  const [showMove, setShowMove] = useState(false);
  const kind = movementKindFor(exercise.name);
  const sets = log?.sets ?? [];
  const repsLabel = getRepRange(exercise.category, microWeek);
  const lastWorkingIndex = exercise.sets - 1;
  const hasBonus = sets.some((s) => s.bonus);
  const allWorkingDone = sets.slice(0, exercise.sets).every((s) => s.done);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug">{exercise.name}</h3>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {exercise.sets} × {repsLabel}
            {exercise.category === "timed" ? "" : " reps"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMove((v) => !v)}
          className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          aria-expanded={showMove}
          aria-label={`Näytä liike: ${MOVEMENT_LABEL_FI[kind]}`}
        >
          <MovementDemo kind={kind} />
        </button>
      </div>

      {showMove && (
        <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-4">
          <MovementDemo kind={kind} expanded />
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            {MOVEMENT_LABEL_FI[kind]}
          </p>
          <p className="mt-1 text-center text-[11px] text-[var(--color-muted)]/80">
            Kaaviokuva — ei korvaa tekniikkaohjetta
          </p>
        </div>
      )}

      <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2.75rem] gap-2 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
        <span>#</span>
        <span>kg</span>
        <span>{exercise.category === "timed" ? "sek" : "reps"}</span>
        <span></span>
      </div>

      <div className="flex flex-col gap-2">
        {sets.map((set, i) => {
          const prev = prevSets?.[i];
          const isBonus = Boolean(set.bonus);
          const isLastWorking = i === lastWorkingIndex;
          return (
            <div
              key={i}
              className={[
                "grid grid-cols-[2rem_1fr_1fr_2.75rem] items-center gap-2",
                set.done ? "animate-check-pop" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-center text-sm font-medium",
                  isBonus ? "text-[var(--color-accent-dim)]" : "text-[var(--color-muted)]",
                ].join(" ")}
              >
                {isBonus ? (intensity === "drop-set" ? "D" : "RP") : i + 1}
              </span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={set.weight ?? ""}
                  placeholder={prev?.weight != null ? formatWeight(prev.weight) : "0"}
                  onChange={(e) =>
                    onChange(i, {
                      weight: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--color-accent)]"
                />
                {prev?.weight != null && set.weight == null && (
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]/70">
                    ed.
                  </span>
                )}
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ""}
                placeholder={prev?.reps != null ? String(prev.reps) : "—"}
                onChange={(e) =>
                  onChange(i, {
                    reps: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                aria-label={set.done ? "Merkitse kesken" : "Merkitse valmiiksi"}
                onClick={() => {
                  const next = !set.done;
                  onChange(i, { done: next });
                  if (next) onSetDone(i, exercise.restSec);
                }}
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold transition-colors",
                  set.done
                    ? "bg-[var(--color-ok)] text-[var(--color-bg)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-muted)]",
                ].join(" ")}
              >
                ✓
              </button>
              {isLastWorking && !isBonus && intensity !== "none" && (
                <p className="col-span-4 -mt-1 text-[11px] text-[var(--color-accent-dim)]">
                  {intensity === "rest-pause"
                    ? "Viimeisen setin jälkeen: 15 s lepo → rest-pause"
                    : "Viimeisen setin jälkeen: drop set (~75 % painosta)"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {allWorkingDone && intensity !== "none" && !hasBonus && (
        <button
          type="button"
          onClick={onAddBonus}
          className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-accent)]/50 py-2.5 text-sm font-medium text-[var(--color-accent)]"
        >
          + {intensity === "rest-pause" ? "Rest-pause -setti" : "Drop set"}
        </button>
      )}
    </section>
  );
}
