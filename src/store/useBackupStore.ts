import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BackupState {
  /** GitHub PAT with gist scope — stays on device */
  gistToken: string;
  gistId: string;
  setGistToken: (token: string) => void;
  setGistId: (id: string) => void;
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set) => ({
      gistToken: "",
      gistId: "",
      setGistToken: (token) => set({ gistToken: token.trim() }),
      setGistId: (id) => set({ gistId: id.trim() }),
    }),
    {
      // Legacy key of the removed PIN-lock store, so saved Gist settings survive.
      name: "sts-lock-v1",
      partialize: (s) => ({ gistToken: s.gistToken, gistId: s.gistId }),
    },
  ),
);