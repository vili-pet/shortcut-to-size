import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hashPin, isValidPin, makeSalt, verifyPin } from "../lib/pin";

const SESSION_KEY = "sts-unlocked";

interface LockState {
  pinSalt: string | null;
  pinHash: string | null;
  /** GitHub PAT with gist scope — stays on device */
  gistToken: string;
  gistId: string;
  unlocked: boolean;

  hydrateUnlock: () => void;
  setUnlocked: (value: boolean) => void;
  setupPin: (pin: string) => Promise<boolean>;
  unlock: (pin: string) => Promise<boolean>;
  changePin: (current: string, next: string) => Promise<"ok" | "bad" | "invalid">;
  clearPin: (current: string) => Promise<boolean>;
  setGistToken: (token: string) => void;
  setGistId: (id: string) => void;
  lockNow: () => void;
}

function readSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionUnlocked(value: boolean) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export const useLockStore = create<LockState>()(
  persist(
    (set, get) => ({
      pinSalt: null,
      pinHash: null,
      gistToken: "",
      gistId: "",
      unlocked: false,

      hydrateUnlock: () => {
        const { pinHash } = get();
        if (!pinHash) {
          set({ unlocked: true });
          return;
        }
        set({ unlocked: readSessionUnlocked() });
      },

      setUnlocked: (value) => {
        writeSessionUnlocked(value);
        set({ unlocked: value });
      },

      setupPin: async (pin) => {
        if (!isValidPin(pin)) return false;
        const salt = makeSalt();
        const hash = await hashPin(pin, salt);
        writeSessionUnlocked(true);
        set({ pinSalt: salt, pinHash: hash, unlocked: true });
        return true;
      },

      unlock: async (pin) => {
        const { pinSalt, pinHash } = get();
        if (!pinSalt || !pinHash) return false;
        const ok = await verifyPin(pin, pinSalt, pinHash);
        if (ok) {
          writeSessionUnlocked(true);
          set({ unlocked: true });
        }
        return ok;
      },

      changePin: async (current, next) => {
        const { pinSalt, pinHash } = get();
        if (!pinSalt || !pinHash) return "bad";
        if (!(await verifyPin(current, pinSalt, pinHash))) return "bad";
        if (!isValidPin(next)) return "invalid";
        const salt = makeSalt();
        const hash = await hashPin(next, salt);
        set({ pinSalt: salt, pinHash: hash });
        return "ok";
      },

      clearPin: async (current) => {
        const { pinSalt, pinHash } = get();
        if (!pinSalt || !pinHash) return true;
        if (!(await verifyPin(current, pinSalt, pinHash))) return false;
        writeSessionUnlocked(true);
        set({ pinSalt: null, pinHash: null, unlocked: true });
        return true;
      },

      setGistToken: (token) => set({ gistToken: token.trim() }),
      setGistId: (id) => set({ gistId: id.trim() }),

      lockNow: () => {
        writeSessionUnlocked(false);
        set({ unlocked: false });
      },
    }),
    {
      name: "sts-lock-v1",
      partialize: (s) => ({
        pinSalt: s.pinSalt,
        pinHash: s.pinHash,
        gistToken: s.gistToken,
        gistId: s.gistId,
      }),
    },
  ),
);

export function hasPinConfigured(): boolean {
  return Boolean(useLockStore.getState().pinHash);
}
