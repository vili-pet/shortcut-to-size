import { Link, Navigate, useParams } from "react-router-dom";
import { MovementDemo } from "../components/MovementDemo";
import {
  getIntensityLabelFi,
  getRepRange,
  MAIN_REP_RANGES,
  resolveWorkout,
  type WorkoutDayId,
} from "../data/program";
import { useProgramWeek } from "../lib/hooks";
import { movementKindFor } from "../lib/movement";

export function PreviewPage() {
  const { week: weekParam, dayId } = useParams();
  const currentWeek = useProgramWeek();
  const week = Number(weekParam);
  const workoutId = Number(dayId) as WorkoutDayId;

  if (
    !Number.isFinite(week) ||
    week < 1 ||
    week > 12 ||
    ![1, 2, 3, 4].includes(workoutId)
  ) {
    return <Navigate to="/viikko" replace />;
  }

  const resolved = resolveWorkout(week, workoutId);
  const isCurrentWeek = week === currentWeek;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
            Esikatselu · vk {week} · vaihe {resolved.phase}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
            {resolved.workout.titleEn}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {resolved.workout.titleFi}
          </p>
          <p className="mt-1 text-xs text-[var(--color-accent-dim)]">
            {MAIN_REP_RANGES[resolved.microWeek]} ·{" "}
            {getIntensityLabelFi(resolved.intensity)}
          </p>
        </div>
        <Link
          to={`/viikko?w=${week}`}
          className="text-xs text-[var(--color-muted)] underline"
        >
          Takaisin
        </Link>
      </div>

      {!isCurrentWeek && (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)]">
          Tämä on viikon {week} ohjelma. Nykyinen treeniviikkosi on {currentWeek}.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {resolved.exercises.map((ex, index) => {
          const kind = movementKindFor(ex.name);
          const reps = getRepRange(ex.category, resolved.microWeek);
          return (
            <li
              key={ex.id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3"
            >
              <span className="w-5 text-center text-xs tabular-nums text-[var(--color-muted)]">
                {index + 1}
              </span>
              <MovementDemo kind={kind} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{ex.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {ex.sets} × {reps}
                  {ex.category === "timed" ? "" : " reps"}
                  {resolved.intensity !== "none" ? " · +" + (resolved.intensity === "rest-pause" ? "RP" : "drop") : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {isCurrentWeek ? (
        <Link
          to={`/treeni/aloita/${workoutId}`}
          className="block rounded-2xl bg-[var(--color-accent)] py-4 text-center text-base font-semibold text-[var(--color-bg)]"
        >
          Aloita tämä treeni
        </Link>
      ) : (
        <p className="text-center text-xs text-[var(--color-muted)]">
          Treenin voi aloittaa, kun olet viikolla {week} (vaihda asetuksista tai odota).
        </p>
      )}
    </div>
  );
}
