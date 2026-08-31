import {
  exerciseNameById,
  weekToMicro,
  type WorkoutDayId,
} from "../data/program";
import type { ExerciseLog, SessionLog } from "../store/useAppStore";

/** Prefer same microcycle (same rep range) from an earlier week, else last same-day session. */
export function pickSourceSession(
  sessions: SessionLog[],
  workoutId: WorkoutDayId,
  programWeek: number,
): SessionLog | undefined {
  const micro = weekToMicro(programWeek);
  const completed = sessions
    .filter(
      (s) =>
        s.workoutId === workoutId &&
        Boolean(s.completedAt) &&
        s.programWeek < programWeek,
    )
    .sort((a, b) => b.programWeek - a.programWeek);

  const sameRepRange = completed.find((s) => weekToMicro(s.programWeek) === micro);
  if (sameRepRange) return sameRepRange;

  return completed[0];
}

export function workingWeightFromLog(log: ExerciseLog | undefined): number | null {
  if (!log) return null;
  const done = [...log.sets]
    .reverse()
    .find((st) => st.done && st.weight != null && !st.bonus && st.weight > 0);
  if (done?.weight != null) return done.weight;
  const any = [...log.sets]
    .reverse()
    .find((st) => st.weight != null && !st.bonus && st.weight > 0);
  return any?.weight ?? null;
}

export function findExerciseLog(
  session: SessionLog | undefined,
  exerciseId: string,
  exerciseName: string,
): ExerciseLog | undefined {
  if (!session) return undefined;
  const byId = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (byId) return byId;
  return session.exercises.find(
    (e) => exerciseNameById(e.exerciseId) === exerciseName,
  );
}

export function suggestWeight(opts: {
  sessions: SessionLog[];
  workoutId: WorkoutDayId;
  programWeek: number;
  exerciseId: string;
  exerciseName: string;
  lastWeights: Record<string, number>;
}): number | undefined {
  const { sessions, workoutId, programWeek, exerciseId, exerciseName, lastWeights } =
    opts;
  const source = pickSourceSession(sessions, workoutId, programWeek);
  const fromSession = workingWeightFromLog(
    findExerciseLog(source, exerciseId, exerciseName),
  );
  if (fromSession != null) return fromSession;

  const byName = lastWeights[`name:${exerciseName}`];
  if (byName != null) return byName;
  return lastWeights[exerciseId];
}

export function weightKeys(exerciseId: string, exerciseName: string): string[] {
  return [exerciseId, `name:${exerciseName}`];
}
