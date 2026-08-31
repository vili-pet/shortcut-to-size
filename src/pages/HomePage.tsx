import { Link } from "react-router-dom";
import {
  attribution,
  getIntensity,
  getIntensityLabelFi,
  MAIN_REP_RANGES,
  resolveWorkout,
  weekToMicro,
  weekToPhase,
  workoutIdForDate,
} from "../data/program";
import { useProgramWeek } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";

export function HomePage() {
  const programWeek = useProgramWeek();
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const phase = weekToPhase(programWeek);
  const micro = weekToMicro(programWeek);
  const intensity = getIntensity(micro);
  const todayWorkoutId = workoutIdForDate(new Date());
  const done =
    programWeek > 12 ||
    (programWeek === 12 && false);

  let cta: { to: string; label: string; sub: string } | null = null;

  if (activeSessionId) {
    cta = {
      to: `/treeni/${activeSessionId}`,
      label: "Jatka treeniä",
      sub: "Aktiivinen sessio kesken",
    };
  } else if (todayWorkoutId) {
    const resolved = resolveWorkout(programWeek, todayWorkoutId);
    cta = {
      to: `/treeni/aloita/${todayWorkoutId}`,
      label: "Aloita tänään",
      sub: resolved.workout.titleFi,
    };
  } else {
    cta = {
      to: "/viikko",
      label: "Lepopäivä",
      sub: "Katso viikon aikataulu",
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--color-accent)]/10 blur-2xl"
        />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Vaihe {phase} · viikko {programWeek}/12
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-6xl leading-none tracking-wide text-[var(--color-ink)]">
          {MAIN_REP_RANGES[micro]}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Mikroviikko {micro}/4 · {getIntensityLabelFi(intensity)}
        </p>
      </section>

      {cta && (
        <Link
          to={cta.to}
          className="block rounded-2xl bg-[var(--color-accent)] px-5 py-5 text-[var(--color-bg)] transition active:scale-[0.99]"
        >
          <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
            {cta.label}
          </p>
          <p className="mt-1 text-sm font-medium opacity-80">{cta.sub}</p>
        </Link>
      )}

      <section className="grid grid-cols-2 gap-3">
        {([1, 2, 3, 4] as const).map((day) => {
          const w = resolveWorkout(programWeek, day);
          const isToday = todayWorkoutId === day;
          return (
            <Link
              key={day}
              to={`/treeni/aloita/${day}`}
              className={[
                "rounded-2xl border p-4 transition",
                isToday
                  ? "border-[var(--color-accent)] bg-[var(--color-surface-2)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]",
              ].join(" ")}
            >
              <p className="text-xs text-[var(--color-muted)]">Päivä {day}</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{w.workout.titleFi}</p>
            </Link>
          );
        })}
      </section>

      {done && (
        <p className="text-center text-sm text-[var(--color-ok)]">
          12 viikkoa valmis — voit aloittaa uuden kierroksen asetuksista.
        </p>
      )}

      <p className="text-[11px] leading-relaxed text-[var(--color-muted)]/80">
        {attribution()}
      </p>
    </div>
  );
}
