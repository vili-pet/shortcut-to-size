import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProgressMedia {
  id: string;
  /** "video" is reserved for a future release; v1 only captures photos. */
  type: "photo" | "video";
  /** Relative to Directory.Data/progress/ — never a URL or base64 payload. */
  fileName: string;
  takenAt: string;
  note?: string;
}

export interface ReminderSlot {
  /** 1 = Monday … 7 = Sunday */
  weekday: number;
  hour: number;
  minute: number;
}

export interface ReminderSettings {
  enabled: boolean;
  slots: ReminderSlot[];
}

interface ProgressState {
  media: ProgressMedia[];
  reminders: ReminderSettings;
  addMedia: (m: ProgressMedia) => void;
  removeMedia: (id: string) => void;
  setReminders: (r: ReminderSettings) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      media: [],
      reminders: {
        enabled: false,
        slots: [
          { weekday: 1, hour: 9, minute: 0 },
          { weekday: 4, hour: 18, minute: 0 },
        ],
      },
      addMedia: (m) => set((s) => ({ media: [...s.media, m] })),
      removeMedia: (id) =>
        set((s) => ({ media: s.media.filter((m) => m.id !== id) })),
      setReminders: (r) => set({ reminders: r }),
    }),
    {
      name: "sts-progress-v1",
      version: 1,
      partialize: (s) => ({ media: s.media, reminders: s.reminders }),
    },
  ),
);