import { create } from "zustand";
import { persist } from "zustand/middleware";
import { exerciseNameById, todayIso, type WorkoutDayId } from "../data/program";
import { pickSourceSession, suggestWeight, weightKeys } from "../lib/weights";

export interface LoggedSet {
  weight: number | null;
  reps: number | null;
  done: boolean;
  /** Extra intensity set (rest-pause or drop) */
  bonus?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface SessionLog {
  id: string;
  date: string;
  programWeek: number;
  workoutId: WorkoutDayId;
  exercises: ExerciseLog[];
  completedAt?: string;
}

interface AppState {
  startDate: string;
  /** Manual week override; null = derive from startDate */
  manualWeek: number | null;
  unit: "kg";
  sessions: SessionLog[];
  /** exerciseId | name:Exercise Name -> last working weight */
  lastWeights: Record<string, number>;
  activeSessionId: string | null;

  setStartDate: (iso: string) => void;
  setManualWeek: (week: number | null) => void;
  startSession: (
    programWeek: number,
    workoutId: WorkoutDayId,
    exerciseDefs: { id: string; name: string; sets: number }[],
  ) => string;
  logSet: (
    sessionId: string,
    exerciseId: string,
    setIndex: number,
    patch: Partial<LoggedSet>,
  ) => void;
  completeSession: (sessionId: string) => void;
  discardActiveSession: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAll: () => void;
}

function emptySets(count: number, lastWeight?: number): LoggedSet[] {
  return Array.from({ length: count }, () => ({
    weight: lastWeight ?? null,
    reps: null,
    done: false,
  }));
}

function rememberWeight(
  lastWeights: Record<string, number>,
  exerciseId: string,
  weight: number,
) {
  const name = exerciseNameById(exerciseId);
  for (const key of weightKeys(exerciseId, name ?? exerciseId)) {
    lastWeights[key] = weight;
  }
}

const initial = {
  startDate: todayIso(),
  manualWeek: null as number | null,
  unit: "kg" as const,
  sessions: [] as SessionLog[],
  lastWeights: {} as Record<string, number>,
  activeSessionId: null as string | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      setStartDate: (iso) => set({ startDate: iso }),

      setManualWeek: (week) => set({ manualWeek: week }),

      startSession: (programWeek, workoutId, exerciseDefs) => {
        const id = `${Date.now()}`;
        const { lastWeights, sessions } = get();
        const session: SessionLog = {
          id,
          date: todayIso(),
          programWeek,
          workoutId,
          exercises: exerciseDefs.map((e) => {
            const suggested = suggestWeight({
              sessions,
              workoutId,
              programWeek,
              exerciseId: e.id,
              exerciseName: e.name,
              lastWeights,
            });
            return {
              exerciseId: e.id,
              sets: emptySets(e.sets, suggested),
            };
          }),
        };
        set((s) => ({
          sessions: [...s.sessions, session],
          activeSessionId: id,
        }));
        return id;
      },

      logSet: (sessionId, exerciseId, setIndex, patch) => {
        set((s) => {
          const sessions = s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              exercises: sess.exercises.map((ex) => {
                if (ex.exerciseId !== exerciseId) return ex;
                const sets = ex.sets.map((st, i) =>
                  i === setIndex ? { ...st, ...patch } : st,
                );
                return { ...ex, sets };
              }),
            };
          });

          const lastWeights = { ...s.lastWeights };
          if (patch.done && patch.weight != null && patch.weight > 0) {
            rememberWeight(lastWeights, exerciseId, patch.weight);
          } else if (patch.weight != null && patch.weight > 0) {
            const sess = sessions.find((x) => x.id === sessionId);
            const ex = sess?.exercises.find((e) => e.exerciseId === exerciseId);
            const st = ex?.sets[setIndex];
            if (st?.done) rememberWeight(lastWeights, exerciseId, patch.weight);
          }

          return { sessions, lastWeights };
        });
      },

      completeSession: (sessionId) => {
        set((s) => {
          const lastWeights = { ...s.lastWeights };
          const sessions = s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            for (const ex of sess.exercises) {
              const done = [...ex.sets]
                .reverse()
                .find((st) => st.done && st.weight != null && st.weight > 0);
              if (done?.weight != null) {
                rememberWeight(lastWeights, ex.exerciseId, done.weight);
              }
            }
            return { ...sess, completedAt: new Date().toISOString() };
          });
          return {
            sessions,
            lastWeights,
            activeSessionId:
              s.activeSessionId === sessionId ? null : s.activeSessionId,
          };
        });
      },

      discardActiveSession: () => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((s) => ({
          sessions: s.sessions.filter((x) => x.id !== activeSessionId),
          activeSessionId: null,
        }));
      },

      exportData: () => {
        const { startDate, manualWeek, sessions, lastWeights } = get();
        return JSON.stringify(
          {
            startDate,
            manualWeek,
            sessions,
            lastWeights,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json) as Partial<AppState>;
          if (!data.startDate || !Array.isArray(data.sessions)) return false;
          set({
            startDate: data.startDate,
            manualWeek: data.manualWeek ?? null,
            sessions: data.sessions,
            lastWeights: data.lastWeights ?? {},
            activeSessionId: null,
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAll: () => set({ ...initial, startDate: todayIso() }),
    }),
    { name: "sts-pwa-v1" },
  ),
);

export function getSession(sessionId: string | null): SessionLog | undefined {
  if (!sessionId) return undefined;
  return useAppStore.getState().sessions.find((s) => s.id === sessionId);
}

export function previousSessionFor(
  workoutId: WorkoutDayId,
  beforeSessionId?: string,
  programWeek?: number,
): SessionLog | undefined {
  const sessions = useAppStore
    .getState()
    .sessions.filter((s) => s.id !== beforeSessionId);

  if (programWeek != null) {
    const source = pickSourceSession(sessions, workoutId, programWeek);
    if (source) return source;
  }

  return sessions
    .filter((s) => s.workoutId === workoutId && s.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];
}
