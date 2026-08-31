import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getIntensityLabelFi,
  MAIN_REP_RANGES,
  resolveWorkout,
  SCHEDULE_DAYS,
  weekToMicro,
  weekToPhase,
} from "../data/program";
import { useProgramWeek } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";

export function WeekPage() {
  const currentWeek = useProgramWeek();
  const sessions = useAppStore((s) => s.sessions);
  const [params, setParams] = useSearchParams();
  const paramWeek = Number(params.get("w"));
  const viewWeek = useMemo(() => {
    if (Number.isFinite(paramWeek) && paramWeek >= 1 && paramWeek <= 12) {
      return paramWeek;
    }
    return currentWeek;
  }, [paramWeek, currentWeek]);

  const setViewWeek = (week: number) => {
    const w = Math.min(12, Math.max(1, week));
    setParams(w === currentWeek ? {} : { w: String(w) }, { replace: true });
  };

  const phase = weekToPhase(viewWeek);
  const micro = weekToMicro(viewWeek);
  const intensity = getIntensityLabelFi(
    resolveWorkout(viewWeek, 1).intensity,
  );
  const isCurrent = viewWeek === currentWeek;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
            Viikko {viewWeek}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Vaihe {phase} · {MAIN_REP_RANGES[micro]} reps
            {isCurrent ? " · nykyinen" : " · esikatselu"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Edellinen viikko"
            disabled={viewWeek <= 1}
            onClick={() => setViewWeek(viewWeek - 1)}
            className="h-11 w-11 rounded-xl bg-[var(--color-surface-2)] text-lg disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Seuraava viikko"
            disabled={viewWeek >= 12}
            onClick={() => setViewWeek(viewWeek + 1)}
            className="h-11 w-11 rounded-xl bg-[var(--color-surface-2)] text-lg disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
          const active = w === viewWeek;
          const isNow = w === currentWeek;
          return (
            <button
              key={w}
              type="button"
              onClick={() => setViewWeek(w)}
              className={[
                "flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition",
                active
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] ring-1 ring-[var(--color-border)]",
                isNow && !active ? "ring-[var(--color-accent)]/50" : "",
              ].join(" ")}
            >
              {w}
            </button>
          );
        })}
      </div>

      <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)]">
        {intensity}
        {!isCurrent && (
          <span className="block mt-1 text-[var(--color-accent-dim)]">
            Selailu — nykyinen ohjelmaviikko on {currentWeek}.
          </span>
        )}
      </p>

      <ul className="flex flex-col gap-3">
        {SCHEDULE_DAYS.map((d) => {
          if (d.workoutId == null) {
            return (
              <li
                key={d.label}
                className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-4 text-[var(--color-muted)]"
              >
                <span className="font-medium text-[var(--color-ink)]">{d.label}</span>
                <span className="ml-2 text-sm">Lepo</span>
              </li>
            );
          }
          const w = resolveWorkout(viewWeek, d.workoutId);
          const completedThisWeek = sessions.some(
            (s) =>
              s.workoutId === d.workoutId &&
              s.programWeek === viewWeek &&
              Boolean(s.completedAt),
          );

          return (
            <li key={d.label}>
              <Link
                to={`/esikatselu/${viewWeek}/${d.workoutId}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
              >
                <div>
                  <p className="text-xs text-[var(--color-muted)]">
                    {d.label} · päivä {d.workoutId}
                  </p>
                  <p className="font-semibold">{w.workout.titleFi}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {w.exercises.length} liikettä · {MAIN_REP_RANGES[micro]}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    completedThisWeek
                      ? "bg-[var(--color-ok)]/20 text-[var(--color-ok)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {completedThisWeek ? "Tehty" : "Katso"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => setViewWeek(currentWeek)}
          className="text-sm font-medium text-[var(--color-accent)]"
        >
          Palaa nykyiseen viikkoon ({currentWeek})
        </button>
      )}
    </div>
  );
}
