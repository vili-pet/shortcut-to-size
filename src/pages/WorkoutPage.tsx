import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ExerciseCard } from "../components/ExerciseCard";
import { RestTimer } from "../components/RestTimer";
import {
  getIntensityLabelFi,
  resolveWorkout,
  type WorkoutDayId,
} from "../data/program";
import { formatWeight, useProgramWeek } from "../lib/hooks";
import {
  previousSessionFor,
  useAppStore,
  type LoggedSet,
} from "../store/useAppStore";
import { findExerciseLog } from "../lib/weights";

export function StartWorkoutRedirect() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const programWeek = useProgramWeek();
  const startSession = useAppStore((s) => s.startSession);
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const sessions = useAppStore((s) => s.sessions);
  const lock = useRef(false);

  const workoutId = Number(dayId) as WorkoutDayId;
  const valid = [1, 2, 3, 4].includes(workoutId);

  useEffect(() => {
    if (!valid || lock.current) return;
    lock.current = true;

    const incomplete = sessions.find(
      (s) =>
        s.workoutId === workoutId &&
        !s.completedAt &&
        (s.id === activeSessionId || s.programWeek === programWeek),
    );
    if (incomplete) {
      navigate(`/treeni/${incomplete.id}`, { replace: true });
      return;
    }

    const resolved = resolveWorkout(programWeek, workoutId);
    const id = startSession(
      programWeek,
      workoutId,
      resolved.exercises.map((e) => ({ id: e.id, name: e.name, sets: e.sets })),
    );
    navigate(`/treeni/${id}`, { replace: true });
  }, [
    valid,
    sessions,
    activeSessionId,
    workoutId,
    programWeek,
    startSession,
    navigate,
  ]);

  if (!valid) return <Navigate to="/" replace />;
  return (
    <p className="text-sm text-[var(--color-muted)]">Avataan treeniä…</p>
  );
}

export function WorkoutPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const sessions = useAppStore((s) => s.sessions);
  const logSet = useAppStore((s) => s.logSet);
  const completeSession = useAppStore((s) => s.completeSession);
  const discardActiveSession = useAppStore((s) => s.discardActiveSession);
  const lastWeights = useAppStore((s) => s.lastWeights);

  const session = sessions.find((s) => s.id === sessionId);
  const [timerSec, setTimerSec] = useState(90);
  const [timerOn, setTimerOn] = useState(false);

  const prev = useMemo(
    () =>
      session
        ? previousSessionFor(session.workoutId, session.id, session.programWeek)
        : undefined,
    [session],
  );

  if (!session) {
    return (
      <div className="space-y-4">
        <p>Sessiota ei löytynyt.</p>
        <Link to="/" className="text-[var(--color-accent)]">
          Takaisin
        </Link>
      </div>
    );
  }

  const resolved = resolveWorkout(session.programWeek, session.workoutId);

  const addBonus = (exerciseId: string) => {
    const exLog = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exLog) return;
    const last = exLog.sets[exLog.sets.length - 1];
    const dropWeight =
      resolved.intensity === "drop-set" && last?.weight
        ? Math.round(last.weight * 0.75 * 2) / 2
        : last?.weight ?? lastWeights[exerciseId] ?? null;

    useAppStore.setState((s) => ({
      sessions: s.sessions.map((sess) => {
        if (sess.id !== session.id) return sess;
        return {
          ...sess,
          exercises: sess.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  weight: dropWeight,
                  reps: null,
                  done: false,
                  bonus: true,
                } satisfies LoggedSet,
              ],
            };
          }),
        };
      }),
    }));
  };

  const finish = () => {
    completeSession(session.id);
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
            V{session.programWeek} · {resolved.mainReps} · vaihe {resolved.phase}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
            {resolved.workout.titleEn}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">{resolved.workout.titleFi}</p>
          <p className="mt-1 text-xs text-[var(--color-accent-dim)]">
            {getIntensityLabelFi(resolved.intensity)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Hylätäänkö tämä sessio?")) {
              discardActiveSession();
              navigate("/");
            }
          }}
          className="text-xs text-[var(--color-muted)] underline"
        >
          Peru
        </button>
      </div>

      {resolved.exercises.map((exercise) => {
        const log = session.exercises.find((e) => e.exerciseId === exercise.id);
        const prevEx = findExerciseLog(prev, exercise.id, exercise.name);
        return (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            microWeek={resolved.microWeek}
            intensity={resolved.intensity}
            log={log}
            prevSets={prevEx?.sets}
            onChange={(setIndex, patch) =>
              logSet(session.id, exercise.id, setIndex, patch)
            }
            onSetDone={(_i, restSec) => {
              setTimerSec(restSec);
              setTimerOn(true);
            }}
            onAddBonus={() => addBonus(exercise.id)}
          />
        );
      })}

      <button
        type="button"
        onClick={finish}
        className="rounded-2xl bg-[var(--color-accent)] py-4 text-center text-base font-semibold text-[var(--color-bg)]"
      >
        Merkitse treeni valmiiksi
      </button>

      {prev && (
        <p className="text-center text-xs text-[var(--color-muted)]">
          Edellinen sama päivä:{" "}
          {prev.exercises
            .slice(0, 1)
            .map((e) => {
              const w = e.sets.find((s) => s.done)?.weight;
              return w != null ? `${formatWeight(w)} kg` : null;
            })
            .filter(Boolean)
            .join(", ") || "—"}
        </p>
      )}

      <RestTimer
        seconds={timerSec}
        active={timerOn}
        onDone={() => setTimerOn(false)}
        onDismiss={() => setTimerOn(false)}
      />
    </div>
  );
}
