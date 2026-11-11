import { exerciseVideoUrl } from "./exerciseVideos.ts";

/** Jim Stoppani Shortcut to Size — program structure for personal tracker use. */

export type RepCategory = "main" | "calves" | "abs" | "timed";
export type Intensity = "rest-pause" | "drop-set" | "none";
export type WorkoutDayId = 1 | 2 | 3 | 4;

export interface ExerciseTemplate {
  id: string;
  name: string;
  videoUrl?: string;
  sets: number;
  category: RepCategory;
  /** Rest seconds between sets */
  restSec: number;
}

export interface WorkoutTemplate {
  id: WorkoutDayId;
  titleFi: string;
  titleEn: string;
  muscles: string;
  exercises: ExerciseTemplate[];
  /** Abs/core rotate by microcycle week (1–4) within each phase */
  absByMicroWeek: Record<1 | 2 | 3 | 4, ExerciseTemplate[]>;
}

export interface PhaseTemplate {
  phase: 1 | 2 | 3;
  workouts: WorkoutTemplate[];
}

export const MAIN_REP_RANGES: Record<1 | 2 | 3 | 4, string> = {
  1: "12–15",
  2: "9–11",
  3: "6–8",
  4: "3–5",
};

export const CALVES_REP_RANGES: Record<1 | 2 | 3 | 4, string> = {
  1: "25–30",
  2: "15–20",
  3: "10–14",
  4: "6–9",
};

export const ABS_REP_RANGES: Record<1 | 2 | 3 | 4, string> = {
  1: "20–30",
  2: "15–19",
  3: "10–14",
  4: "6–9",
};

/** Plank hold targets by micro week (seconds) */
export const PLANK_TARGETS: Record<1 | 2 | 3 | 4, number> = {
  1: 60,
  2: 60,
  3: 60,
  4: 75,
};

export const PHASE2_PLANK: Record<1 | 2 | 3 | 4, number> = {
  1: 75,
  2: 75,
  3: 75,
  4: 90,
};

export const PHASE3_PLANK: Record<1 | 2 | 3 | 4, number> = {
  1: 90,
  2: 90,
  3: 90,
  4: 105,
};

export const SCHEDULE_DAYS = [
  { weekday: 1, label: "Ma", workoutId: 1 as WorkoutDayId },
  { weekday: 2, label: "Ti", workoutId: 2 as WorkoutDayId },
  { weekday: 3, label: "Ke", workoutId: null },
  { weekday: 4, label: "To", workoutId: 3 as WorkoutDayId },
  { weekday: 5, label: "Pe", workoutId: 4 as WorkoutDayId },
  { weekday: 6, label: "La", workoutId: null },
  { weekday: 0, label: "Su", workoutId: null },
] as const;

function ex(
  id: string,
  name: string,
  sets: number,
  category: RepCategory,
  restSec: number,
): ExerciseTemplate {
  return { id, name, sets, category, restSec, videoUrl: exerciseVideoUrl(name) };
}

const absW1 = (prefix: string): ExerciseTemplate[] => [
  ex(`${prefix}-hip-thrust`, "Hip Thrust", 3, "abs", 60),
  ex(`${prefix}-crunch`, "Crunch", 3, "abs", 60),
  ex(`${prefix}-oblique`, "Oblique Crunch", 3, "abs", 60),
];

const absW2 = (prefix: string): ExerciseTemplate[] => [
  ex(`${prefix}-hlr`, "Hanging Leg Raise", 3, "abs", 60),
  ex(`${prefix}-crunch`, "Crunch", 3, "abs", 60),
  ex(`${prefix}-side-bend`, "Dumbbell Side Bend", 3, "abs", 60),
];

const absW3 = (prefix: string): ExerciseTemplate[] => [
  ex(`${prefix}-hip-thrust`, "Hip Thrust (weighted)", 3, "abs", 60),
  ex(`${prefix}-cable-crunch`, "Cable Crunch", 3, "abs", 60),
  ex(`${prefix}-oblique-cable`, "Oblique Cable Crunch", 3, "abs", 60),
];

const absW4 = (prefix: string): ExerciseTemplate[] => [
  ex(`${prefix}-smith-ht`, "Smith Machine Hip Thrust", 3, "abs", 60),
  ex(`${prefix}-machine-crunch`, "Machine Crunch", 3, "abs", 60),
  ex(`${prefix}-roundhouse`, "Band Roundhouse Elbow", 3, "abs", 60),
];

function legsAbs(
  phase: 1 | 2 | 3,
  plankMap: Record<1 | 2 | 3 | 4, number>,
): Record<1 | 2 | 3 | 4, ExerciseTemplate[]> {
  const p = `p${phase}-w4`;
  return {
    1: [
      ...absW1(p).slice(0, 2),
      ex(`${p}-plank`, `Plank (${plankMap[1]}s)`, 3, "timed", 60),
    ],
    2: [
      ex(`${p}-hlr`, "Hanging Leg Raise", 3, "abs", 60),
      ex(`${p}-crunch`, "Crunch", 3, "abs", 60),
      ex(`${p}-side-plank`, `Side Plank (${plankMap[2]}s)`, 3, "timed", 60),
    ],
    3: [
      ex(`${p}-hip-thrust`, "Hip Thrust (weighted)", 3, "abs", 60),
      ex(`${p}-cable-crunch`, "Cable Crunch", 3, "abs", 60),
      ex(`${p}-woodchop`, "Cable Woodchopper", 3, "abs", 60),
    ],
    4: [
      ...absW4(p).slice(0, 2),
      ex(`${p}-plank`, `Plank (${plankMap[4]}s)`, 3, "timed", 60),
    ],
  };
}

function backAbs(phase: 1 | 2 | 3): Record<1 | 2 | 3 | 4, ExerciseTemplate[]> {
  const p = `p${phase}-w2`;
  return {
    1: absW1(p),
    2: absW2(p),
    3: absW3(p),
    4: absW4(p),
  };
}

const phase1: PhaseTemplate = {
  phase: 1,
  workouts: [
    {
      id: 1,
      titleFi: "Rinta, ojentajat, pohkeet",
      titleEn: "Chest, Triceps, Calves",
      muscles: "Chest · Triceps · Calves",
      exercises: [
        ex("p1-bench", "Bench Press", 4, "main", 120),
        ex("p1-incline-bb", "Incline Bench Press", 3, "main", 90),
        ex("p1-incline-fly", "Incline Dumbbell Flye", 3, "main", 90),
        ex("p1-crossover", "Cable Crossover (High Pulley)", 3, "main", 90),
        ex("p1-pressdown", "Triceps Pressdown", 4, "main", 90),
        ex("p1-skull", "Lying Triceps Extension", 3, "main", 90),
        ex("p1-oh-cable", "Overhead Cable Triceps Extension", 3, "main", 90),
        ex("p1-stand-calf", "Standing Calf Raise", 4, "calves", 60),
        ex("p1-seat-calf", "Seated Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 2,
      titleFi: "Selkä, hauis, vatsat",
      titleEn: "Back, Biceps, Abs",
      muscles: "Back · Biceps · Abs",
      exercises: [
        ex("p1-db-row", "One-Arm Dumbbell Row", 4, "main", 120),
        ex("p1-wide-pd", "Wide-Grip Lat Pulldown", 3, "main", 90),
        ex("p1-stand-pd", "Standing Lat Pulldown", 3, "main", 90),
        ex("p1-sa-pd", "Straight-Arm Pulldown", 3, "main", 90),
        ex("p1-bb-curl", "Barbell Curl", 4, "main", 90),
        ex("p1-inc-curl", "Incline Dumbbell Curl", 3, "main", 90),
        ex("p1-cable-curl", "One-Arm High Cable Curl", 3, "main", 90),
      ],
      absByMicroWeek: backAbs(1),
    },
    {
      id: 3,
      titleFi: "Olkapäät, traps, pohkeet",
      titleEn: "Shoulders, Traps, Calves",
      muscles: "Shoulders · Traps · Calves",
      exercises: [
        ex("p1-ohp", "Seated Dumbbell Shoulder Press", 4, "main", 120),
        ex("p1-lateral", "Dumbbell Lateral Raise", 3, "main", 90),
        ex("p1-front", "One-Arm Cable Front Raise", 3, "main", 90),
        ex("p1-rear", "High Cable Rear Delt Flye", 3, "main", 90),
        ex("p1-shrug", "Dumbbell Shrug", 4, "main", 90),
        ex("p1-w3-seat-calf", "Seated Calf Raise", 4, "calves", 60),
        ex("p1-lp-calf", "Leg Press Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 4,
      titleFi: "Jalat ja vatsat",
      titleEn: "Legs & Abs",
      muscles: "Legs · Abs",
      exercises: [
        ex("p1-squat", "Squat", 4, "main", 120),
        ex("p1-1leg-lp", "One-Leg Leg Press", 3, "main", 90),
        ex("p1-leg-ext", "Leg Extension", 3, "main", 90),
        ex("p1-rdl", "Romanian Deadlift", 4, "main", 120),
        ex("p1-leg-curl", "Lying Leg Curl", 3, "main", 90),
      ],
      absByMicroWeek: legsAbs(1, PLANK_TARGETS),
    },
  ],
};

const phase2: PhaseTemplate = {
  phase: 2,
  workouts: [
    {
      id: 1,
      titleFi: "Rinta, ojentajat, pohkeet",
      titleEn: "Chest, Triceps, Calves",
      muscles: "Chest · Triceps · Calves",
      exercises: [
        ex("p2-bench", "Bench Press", 4, "main", 120),
        ex("p2-inc-db", "Incline Dumbbell Press", 3, "main", 90),
        ex("p2-fly", "Dumbbell Flye", 3, "main", 90),
        ex("p2-inc-cable", "Incline Cable Flye", 3, "main", 90),
        ex("p2-pressdown", "Triceps Pressdown", 4, "main", 90),
        ex("p2-oh-db", "Dumbbell Overhead Triceps Extension", 3, "main", 90),
        ex("p2-lying-cable", "Lying Cable Triceps Extension", 3, "main", 90),
        ex("p2-stand-calf", "Standing Calf Raise", 4, "calves", 60),
        ex("p2-seat-calf", "Seated Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 2,
      titleFi: "Selkä, hauis, vatsat",
      titleEn: "Back, Biceps, Abs",
      muscles: "Back · Biceps · Abs",
      exercises: [
        ex("p2-db-row", "One-Arm Dumbbell Row", 4, "main", 120),
        ex("p2-btn-pd", "Behind-the-Neck Pulldown", 3, "main", 90),
        ex("p2-seat-row", "Seated Cable Row (Close)", 3, "main", 90),
        ex("p2-rev-pd", "Reverse-Grip Lat Pulldown", 3, "main", 90),
        ex("p2-bb-curl", "Barbell Curl", 4, "main", 90),
        ex("p2-preacher", "Preacher Curl", 3, "main", 90),
        ex("p2-btb-curl", "Behind-the-Back Cable Curl", 3, "main", 90),
      ],
      absByMicroWeek: backAbs(2),
    },
    {
      id: 3,
      titleFi: "Olkapäät, traps, pohkeet",
      titleEn: "Shoulders, Traps, Calves",
      muscles: "Shoulders · Traps · Calves",
      exercises: [
        ex("p2-ohp", "Dumbbell Shoulder Press", 4, "main", 120),
        ex("p2-upright", "Smith Machine Upright Row", 3, "main", 90),
        ex("p2-cable-lat", "One-Arm Cable Lateral Raise", 3, "main", 90),
        ex("p2-bent-lat", "Bent-Over Lateral Raise", 3, "main", 90),
        ex("p2-shrug", "Barbell Shrug", 4, "main", 90),
        ex("p2-seat-calf", "Seated Calf Raise", 4, "calves", 60),
        ex("p2-lp-calf", "Leg Press Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 4,
      titleFi: "Jalat ja vatsat",
      titleEn: "Legs & Abs",
      muscles: "Legs · Abs",
      exercises: [
        ex("p2-squat", "Squat", 4, "main", 120),
        ex("p2-front", "Front Squat", 3, "main", 90),
        ex("p2-leg-ext", "Leg Extension", 3, "main", 90),
        ex("p2-rdl", "Romanian Deadlift", 4, "main", 120),
        ex("p2-seat-curl", "Seated Leg Curl", 3, "main", 90),
      ],
      absByMicroWeek: legsAbs(2, PHASE2_PLANK),
    },
  ],
};

const phase3: PhaseTemplate = {
  phase: 3,
  workouts: [
    {
      id: 1,
      titleFi: "Rinta, ojentajat, pohkeet",
      titleEn: "Chest, Triceps, Calves",
      muscles: "Chest · Triceps · Calves",
      exercises: [
        ex("p3-bench", "Bench Press", 4, "main", 120),
        ex("p3-rev-inc", "Reverse-Grip Incline Dumbbell Press", 3, "main", 90),
        ex("p3-inc-fly", "Incline Dumbbell Flye", 3, "main", 90),
        ex("p3-crossover", "Cable Crossover (High Pulley)", 3, "main", 90),
        ex("p3-pressdown", "Triceps Pressdown", 4, "main", 90),
        ex("p3-1arm-oh", "One-Arm Overhead Cable Triceps Extension", 3, "main", 90),
        ex("p3-cgbp", "Close-Grip Bench Press", 3, "main", 90),
        ex("p3-stand-calf", "Standing Calf Raise", 4, "calves", 60),
        ex("p3-seat-calf", "Seated Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 2,
      titleFi: "Selkä, hauis, vatsat",
      titleEn: "Back, Biceps, Abs",
      muscles: "Back · Biceps · Abs",
      exercises: [
        ex("p3-db-row", "One-Arm Dumbbell Row", 4, "main", 120),
        ex("p3-wide-pd", "Wide-Grip Lat Pulldown", 3, "main", 90),
        ex("p3-sa-pd", "Straight-Arm Pulldown", 3, "main", 90),
        ex("p3-seat-row", "Seated Cable Row (Close)", 3, "main", 90),
        ex("p3-bb-curl", "Barbell Curl", 4, "main", 90),
        ex("p3-inc-cable", "Incline Cable Curl", 3, "main", 90),
        ex("p3-conc", "Concentration Curl", 3, "main", 90),
      ],
      absByMicroWeek: backAbs(3),
    },
    {
      id: 3,
      titleFi: "Olkapäät, traps, pohkeet",
      titleEn: "Shoulders, Traps, Calves",
      muscles: "Shoulders · Traps · Calves",
      exercises: [
        ex("p3-ohp", "Seated Dumbbell Shoulder Press", 4, "main", 120),
        ex("p3-lateral", "Dumbbell Lateral Raise", 3, "main", 90),
        ex("p3-upright", "Dumbbell Upright Row", 3, "main", 90),
        ex("p3-bent", "Bent-Over Lateral Raise", 3, "main", 90),
        ex("p3-shrug", "One-Arm Smith Machine Shrug", 4, "main", 90),
        ex("p3-seat-calf", "Seated Calf Raise", 4, "calves", 60),
        ex("p3-lp-calf", "Leg Press Calf Raise", 4, "calves", 60),
      ],
      absByMicroWeek: { 1: [], 2: [], 3: [], 4: [] },
    },
    {
      id: 4,
      titleFi: "Jalat ja vatsat",
      titleEn: "Legs & Abs",
      muscles: "Legs · Abs",
      exercises: [
        ex("p3-squat", "Squat", 4, "main", 120),
        ex("p3-leg-press", "Leg Press", 3, "main", 90),
        ex("p3-leg-ext", "Leg Extension", 3, "main", 90),
        ex("p3-rdl", "Romanian Deadlift", 4, "main", 120),
        ex("p3-leg-curl", "Lying Leg Curl", 3, "main", 90),
      ],
      absByMicroWeek: legsAbs(3, PHASE3_PLANK),
    },
  ],
};

export const PHASES: PhaseTemplate[] = [phase1, phase2, phase3];

export const ANCHOR_NAMES = [
  "Bench Press",
  "Squat",
  "One-Arm Dumbbell Row",
  "Seated Dumbbell Shoulder Press",
  "Dumbbell Shoulder Press",
  "Barbell Curl",
  "Triceps Pressdown",
  "Romanian Deadlift",
] as const;

export function weekToPhase(programWeek: number): 1 | 2 | 3 {
  if (programWeek <= 4) return 1;
  if (programWeek <= 8) return 2;
  return 3;
}

export function weekToMicro(programWeek: number): 1 | 2 | 3 | 4 {
  return (((programWeek - 1) % 4) + 1) as 1 | 2 | 3 | 4;
}

export function getIntensity(microWeek: 1 | 2 | 3 | 4): Intensity {
  if (microWeek <= 2) return "rest-pause";
  return "drop-set";
}

export function getRepRange(
  category: RepCategory,
  microWeek: 1 | 2 | 3 | 4,
): string {
  if (category === "calves") return CALVES_REP_RANGES[microWeek];
  if (category === "abs") return ABS_REP_RANGES[microWeek];
  if (category === "timed") return "aika";
  return MAIN_REP_RANGES[microWeek];
}

export function getIntensityLabelFi(intensity: Intensity): string {
  if (intensity === "rest-pause") return "Rest-pause viimeiseen settiin";
  if (intensity === "drop-set") return "Drop set viimeiseen settiin";
  return "";
}

export function resolveWorkout(
  programWeek: number,
  workoutId: WorkoutDayId,
): {
  phase: 1 | 2 | 3;
  microWeek: 1 | 2 | 3 | 4;
  intensity: Intensity;
  workout: WorkoutTemplate;
  exercises: ExerciseTemplate[];
  mainReps: string;
} {
  const phase = weekToPhase(programWeek);
  const microWeek = weekToMicro(programWeek);
  const intensity = getIntensity(microWeek);
  const phaseData = PHASES[phase - 1];
  const workout = phaseData.workouts.find((w) => w.id === workoutId)!;
  const abs = workout.absByMicroWeek[microWeek] ?? [];
  return {
    phase,
    microWeek,
    intensity,
    workout,
    exercises: [...workout.exercises, ...abs],
    mainReps: MAIN_REP_RANGES[microWeek],
  };
}

export function workoutIdForDate(date: Date): WorkoutDayId | null {
  const day = date.getDay();
  const match = SCHEDULE_DAYS.find((d) => d.weekday === day);
  return match?.workoutId ?? null;
}

/** Program week 1–12 from start date (Monday-aligned weeks). */
export function programWeekFromStart(startDateIso: string, today = new Date()): number {
  const start = parseLocalDate(startDateIso);
  const startMonday = startOfWeekMonday(start);
  const todayMonday = startOfWeekMonday(today);
  const diffMs = todayMonday.getTime() - startMonday.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.min(12, Math.max(1, weeks + 1));
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function attribution(): string {
  return "Perustuu Jim Stoppanin Shortcut to Size -ohjelmaan (alun perin Bodybuilding.com). Henkilökohtainen treeniloki.";
}

/** Resolve exercise display name from any phase/workout template id. */
export function exerciseNameById(id: string): string | undefined {
  for (const phase of PHASES) {
    for (const workout of phase.workouts) {
      for (const e of workout.exercises) {
        if (e.id === id) return e.name;
      }
      for (const abs of Object.values(workout.absByMicroWeek)) {
        for (const e of abs) {
          if (e.id === id) return e.name;
        }
      }
    }
  }
  return undefined;
}
