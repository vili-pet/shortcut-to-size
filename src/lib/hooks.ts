import {
  programWeekFromStart,
  type WorkoutDayId,
} from "../data/program";
import { useAppStore } from "../store/useAppStore";

export function useProgramWeek(): number {
  const startDate = useAppStore((s) => s.startDate);
  const manualWeek = useAppStore((s) => s.manualWeek);
  if (manualWeek != null) return Math.min(12, Math.max(1, manualWeek));
  return programWeekFromStart(startDate);
}

export function sessionKey(
  date: string,
  programWeek: number,
  workoutId: WorkoutDayId,
): string {
  return `${date}-w${programWeek}-d${workoutId}`;
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null || Number.isNaN(kg)) return "—";
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
}
